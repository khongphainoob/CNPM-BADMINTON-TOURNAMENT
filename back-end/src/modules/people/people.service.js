import { query } from '../../config/db.js';
import { AppError } from '../../middleware/error.js';

// ─── Clubs ──────────────────────────────────────────

export async function listClubs() {
  const result = await query('SELECT id, code, name, province, created_at FROM clubs ORDER BY name');
  return result.rows;
}

export async function getClubById(id) {
  const result = await query('SELECT id, code, name, province, created_at FROM clubs WHERE id = $1', [id]);
  return result.rows[0];
}

export async function createClub({ code, name, province }) {
  const result = await query(
    'INSERT INTO clubs (code, name, province) VALUES ($1, $2, $3) RETURNING *',
    [code || null, name, province || null]
  );
  return result.rows[0];
}

export async function updateClub(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined && ['code', 'name', 'province'].includes(key)) {
      fields.push(`${key} = $${idx++}`);
      values.push(val);
    }
  }
  if (fields.length === 0) throw new AppError(400, 'Không có dữ liệu cập nhật', 'NO_DATA');

  values.push(id);
  const result = await query(
    `UPDATE clubs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

// ─── Players ────────────────────────────────────────

export async function listPlayers({ page = 1, limit = 20, clubId, status, search, userId } = {}) {
  const conditions = ['p.deleted_at IS NULL'];
  const params = [];
  let idx = 1;

  if (clubId) {
    conditions.push(`p.club_id = $${idx++}`);
    params.push(clubId);
  }
  if (status) {
    conditions.push(`p.profile_status = $${idx++}`);
    params.push(status);
  }
  if (search) {
    conditions.push(`(p.name ILIKE $${idx} OR p.code ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }
  if (userId) {
    conditions.push(`p.user_id = $${idx++}`);
    params.push(userId);
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const [playersResult, countResult] = await Promise.all([
    query(
      `SELECT p.id, p.code, p.name, p.gender, p.dob, p.rating, p.tier, p.profile_status, p.note,
              p.cccd, p.photo_url, p.user_id, p.created_at,
              c.id AS club_id, c.name AS club_name, c.code AS club_code
         FROM players p
         JOIN clubs c ON c.id = p.club_id
        WHERE ${where}
        ORDER BY p.rating DESC, p.name
        LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    ),
    query(
      `SELECT COUNT(*)::int AS total FROM players p WHERE ${where}`,
      params
    )
  ]);

  return { items: playersResult.rows, total: countResult.rows[0]?.total || 0 };
}

export async function getPlayerById(id) {
  const result = await query(
    `SELECT p.id, p.code, p.name, p.gender, p.dob, p.rating, p.tier, p.profile_status,
            p.note, p.cccd, p.photo_url, p.user_id, p.created_at,
            c.id AS club_id, c.name AS club_name, c.code AS club_code
       FROM players p
       JOIN clubs c ON c.id = p.club_id
      WHERE p.id = $1 AND p.deleted_at IS NULL`,
    [id]
  );
  return result.rows[0];
}

export async function createPlayer({ code, clubId, name, gender, dob, rating = 0, tier, note, cccd, photoUrl, userId }) {
  // Validate club exists
  const club = await getClubById(clubId);
  if (!club) throw new AppError(400, 'CLB không tồn tại', 'INVALID_CLUB');

  const result = await query(
    `INSERT INTO players (code, club_id, name, gender, dob, rating, tier, note, cccd, photo_url, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, code, club_id, name, gender, dob, rating, tier, profile_status, note, cccd, photo_url, user_id, created_at`,
    [code || null, clubId, name, gender, dob || null, rating, tier || null, note || null, cccd || null, photoUrl || null, userId || null]
  );
  return result.rows[0];
}

export async function updatePlayer(id, data) {
  const allowedFields = { code: 'code', clubId: 'club_id', name: 'name', gender: 'gender', dob: 'dob', rating: 'rating', tier: 'tier', note: 'note', cccd: 'cccd', photoUrl: 'photo_url', userId: 'user_id', profileStatus: 'profile_status' };
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [jsKey, dbKey] of Object.entries(allowedFields)) {
    if (data[jsKey] !== undefined) {
      fields.push(`${dbKey} = $${idx++}`);
      values.push(data[jsKey]);
    }
  }
  if (fields.length === 0) throw new AppError(400, 'Không có dữ liệu cập nhật', 'NO_DATA');

  if (data.clubId) {
    const club = await getClubById(data.clubId);
    if (!club) throw new AppError(400, 'CLB không tồn tại', 'INVALID_CLUB');
  }

  values.push(id);
  const result = await query(
    `UPDATE players SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL
     RETURNING id, code, club_id, name, gender, dob, rating, tier, profile_status, note, created_at`,
    values
  );
  return result.rows[0];
}

export async function deletePlayer(id) {
  const result = await query(
    `UPDATE players SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id]
  );
  return !!result.rows[0];
}

export async function approvePlayer(id) {
  const result = await query(
    `UPDATE players SET profile_status = 'approved' WHERE id = $1 AND deleted_at IS NULL
     RETURNING id, code, name, profile_status`,
    [id]
  );
  if (!result.rows[0]) throw new AppError(404, 'Player not found', 'NOT_FOUND');
  return result.rows[0];
}

export async function linkPlayerUser(playerId, userId) {
  // Verify both exist
  const [player, user] = await Promise.all([
    query('SELECT id FROM players WHERE id = $1 AND deleted_at IS NULL', [playerId]),
    query('SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL', [userId])
  ]);
  if (!player.rows[0]) throw new AppError(404, 'Player not found', 'NOT_FOUND');
  if (!user.rows[0]) throw new AppError(404, 'User not found', 'NOT_FOUND');

  const result = await query(
    'UPDATE players SET user_id = $1 WHERE id = $2 RETURNING id, user_id',
    [userId, playerId]
  );
  return result.rows[0];
}

// ─── Referees ───────────────────────────────────────

export async function listReferees() {
  const result = await query(
    'SELECT id, code, name, cert, phone, user_id, created_at FROM referees ORDER BY name'
  );
  return result.rows;
}

export async function getRefereeById(id) {
  const result = await query(
    'SELECT id, code, name, cert, phone, user_id, created_at FROM referees WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

export async function createReferee({ code, name, cert, phone, userId }) {
  const result = await query(
    `INSERT INTO referees (code, name, cert, phone, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, code, name, cert, phone, user_id, created_at`,
    [code || null, name, cert, phone || null, userId || null]
  );
  return result.rows[0];
}

export async function updateReferee(id, data) {
  const allowedFields = { code: 'code', name: 'name', cert: 'cert', phone: 'phone', userId: 'user_id' };
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [jsKey, dbKey] of Object.entries(allowedFields)) {
    if (data[jsKey] !== undefined) {
      fields.push(`${dbKey} = $${idx++}`);
      values.push(data[jsKey]);
    }
  }
  if (fields.length === 0) throw new AppError(400, 'Không có dữ liệu cập nhật', 'NO_DATA');

  values.push(id);
  const result = await query(
    `UPDATE referees SET ${fields.join(', ')} WHERE id = $${idx}
     RETURNING id, code, name, cert, phone, user_id, created_at`,
    values
  );
  return result.rows[0];
}

// ─── Coaches ────────────────────────────────────────

export async function listCoaches() {
  const result = await query(
    `SELECT co.id, co.name, co.phone, co.user_id, co.created_at,
            c.id AS club_id, c.name AS club_name
       FROM coaches co
       LEFT JOIN clubs c ON c.id = co.club_id
      ORDER BY co.name`
  );
  return result.rows;
}

export async function createCoach({ name, clubId, phone, userId }) {
  const result = await query(
    `INSERT INTO coaches (name, club_id, phone, user_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, club_id, phone, user_id, created_at`,
    [name, clubId || null, phone || null, userId || null]
  );
  return result.rows[0];
}
