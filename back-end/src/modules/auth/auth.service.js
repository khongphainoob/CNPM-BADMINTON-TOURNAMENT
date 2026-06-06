import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../config/db.js';
import { AppError } from '../../middleware/error.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.primary_role_code, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

async function findRoleId(code) {
  const result = await query('SELECT id FROM roles WHERE code = $1', [code]);
  return result.rows[0]?.id;
}

async function getUserWithRoles(userId) {
  const result = await query(
    `SELECT u.id, u.email, u.phone, u.name, u.status, u.created_at, u.note,
            u.requested_role_id,
            pr.code AS primary_role_code,
            rr.code AS requested_role_code,
            COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), ARRAY[]::varchar[]) AS roles,
            (SELECT club_id FROM coaches WHERE user_id = u.id UNION SELECT club_id FROM players WHERE user_id = u.id LIMIT 1) AS club_id
       FROM users u
       LEFT JOIN roles pr ON pr.id = u.primary_role_id
       LEFT JOIN roles rr ON rr.id = u.requested_role_id
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      GROUP BY u.id, pr.code, rr.code`,
    [userId]
  );

  return result.rows[0];
}

export async function registerUser({ email, password, name, phone, role = 'spectator' }) {
  // Check duplicate email
  const existing = await query(
    'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL', [email]
  );
  if (existing.rows.length > 0) {
    throw new AppError(409, 'Email đã được đăng ký', 'DUPLICATE_EMAIL');
  }

  // Check duplicate phone
  if (phone) {
    const existingPhone = await query(
      'SELECT id FROM users WHERE phone = $1 AND deleted_at IS NULL', [phone]
    );
    if (existingPhone.rows.length > 0) {
      throw new AppError(409, 'Số điện thoại đã được đăng ký', 'DUPLICATE_PHONE');
    }
  }

  const roleId = await findRoleId(role);
  const passwordHash = await bcrypt.hash(password, 10);
  
  const status = (role === 'spectator' || role === 'athlete') ? 'approved' : 'pending';

  const result = await query(
    `INSERT INTO users (email, phone, password_hash, name, primary_role_id, requested_role_id, status)
     VALUES ($1, $2, $3, $4, $5, $5, $6)
     RETURNING id`,
    [email, phone || null, passwordHash, name, roleId || null, status]
  );

  const userId = result.rows[0].id;

  if (roleId) {
    await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);
  }

  return getUserWithRoles(userId);
}

export async function loginUser({ email, password }) {
  const result = await query(
    `SELECT u.id, u.email, u.password_hash, u.status, pr.code AS primary_role_code,
            COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), ARRAY[]::varchar[]) AS roles
       FROM users u
       LEFT JOIN roles pr ON pr.id = u.primary_role_id
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
      WHERE (u.email = $1 OR u.phone = $1) AND u.deleted_at IS NULL
      GROUP BY u.id, pr.code`,
    [email]
  );

  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError(401, 'Thông tin đăng nhập không đúng', 'INVALID_CREDENTIALS');
  }

  if (user.status === 'pending') {
    throw new AppError(403, 'Tài khoản đang chờ duyệt', 'ACCOUNT_PENDING');
  }

  if (user.status === 'rejected') {
    throw new AppError(403, 'Tài khoản đã bị từ chối', 'ACCOUNT_REJECTED');
  }

  const safeUser = await getUserWithRoles(user.id);
  return { token: signToken(safeUser), user: safeUser };
}

export async function getCurrentUser(userId) {
  return getUserWithRoles(userId);
}

export async function changePassword(userId, oldPassword, newPassword) {
  const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  const user = result.rows[0];
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');

  const valid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!valid) throw new AppError(400, 'Mật khẩu cũ không đúng', 'WRONG_PASSWORD');

  const newHash = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);
}

export async function listUsers({ page = 1, limit = 20, status, role } = {}) {
  const conditions = ['u.deleted_at IS NULL'];
  const params = [];
  let paramIdx = 1;

  if (status) {
    conditions.push(`u.status = $${paramIdx++}`);
    params.push(status);
  }

  if (role) {
    conditions.push(`pr.code = $${paramIdx++}`);
    params.push(role);
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const [usersResult, countResult] = await Promise.all([
    query(
      `SELECT u.id, u.email, u.phone, u.name, u.status, u.created_at, u.note,
              pr.code AS primary_role_code,
              rr.code AS requested_role_code,
              COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), ARRAY[]::varchar[]) AS roles
         FROM users u
         LEFT JOIN roles pr ON pr.id = u.primary_role_id
         LEFT JOIN roles rr ON rr.id = u.requested_role_id
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN roles r ON r.id = ur.role_id
        WHERE ${where}
        GROUP BY u.id, pr.code, rr.code
        ORDER BY u.created_at DESC
        LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset]
    ),
    query(
      `SELECT COUNT(*)::int AS total FROM users u
       LEFT JOIN roles pr ON pr.id = u.primary_role_id
       WHERE ${where}`,
      params
    )
  ]);

  return { items: usersResult.rows, total: countResult.rows[0]?.total || 0 };
}

export async function approveUser(userId, roleCode) {
  const roleId = await findRoleId(roleCode);
  if (!roleId) throw new AppError(400, 'Role không hợp lệ', 'INVALID_ROLE');

  const user = await query('SELECT id, status FROM users WHERE id = $1 AND deleted_at IS NULL', [userId]);
  if (!user.rows[0]) throw new AppError(404, 'User not found', 'NOT_FOUND');

  await query(
    `UPDATE users SET status = 'approved', primary_role_id = $1 WHERE id = $2`,
    [roleId, userId]
  );

  // Ensure user_roles has the role
  await query(
    `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [userId, roleId]
  );

  return getUserWithRoles(userId);
}

export async function rejectUser(userId, note) {
  const user = await query('SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL', [userId]);
  if (!user.rows[0]) throw new AppError(404, 'User not found', 'NOT_FOUND');

  await query(
    `UPDATE users SET status = 'rejected', note = $1 WHERE id = $2`,
    [note || null, userId]
  );

  return getUserWithRoles(userId);
}

export async function changeUserRole(userId, roleCode) {
  const roleId = await findRoleId(roleCode);
  if (!roleId) throw new AppError(400, 'Role không hợp lệ', 'INVALID_ROLE');

  const user = await query('SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL', [userId]);
  if (!user.rows[0]) throw new AppError(404, 'User not found', 'NOT_FOUND');

  await query('UPDATE users SET primary_role_id = $1 WHERE id = $2', [roleId, userId]);

  // Remove old roles, add new one
  await query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
  await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);

  return getUserWithRoles(userId);
}
