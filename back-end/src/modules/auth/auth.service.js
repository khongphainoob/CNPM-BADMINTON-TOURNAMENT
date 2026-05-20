import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../config/db.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.primary_role_code, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

async function findRoleId(code) {
  const result = await query('SELECT id FROM roles WHERE code = $1', [code]);
  return result.rows[0]?.id;
}

async function getUserWithRoles(userId) {
  const result = await query(
    `SELECT u.id, u.email, u.phone, u.name, u.status, u.created_at,
            pr.code AS primary_role_code,
            COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), ARRAY[]::varchar[]) AS roles
       FROM users u
       LEFT JOIN roles pr ON pr.id = u.primary_role_id
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      GROUP BY u.id, pr.code`,
    [userId]
  );

  return result.rows[0];
}

export async function registerUser({ email, password, name, phone, role = 'spectator' }) {
  const roleId = await findRoleId(role);
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (email, phone, password_hash, name, primary_role_id, requested_role_id, status)
     VALUES ($1, $2, $3, $4, $5, $5, 'pending')
     RETURNING id`,
    [email, phone || null, passwordHash, name, roleId || null]
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
      WHERE u.email = $1 AND u.deleted_at IS NULL
      GROUP BY u.id, pr.code`,
    [email]
  );

  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  if (user.status !== 'approved') {
    const error = new Error('Account is not approved');
    error.status = 403;
    throw error;
  }

  const safeUser = await getUserWithRoles(user.id);
  return { token: signToken(safeUser), user: safeUser };
}

export async function getCurrentUser(userId) {
  return getUserWithRoles(userId);
}
