import { query } from '../../config/db.js';

export async function listClubs() {
  const result = await query('SELECT id, code, name, province, created_at FROM clubs ORDER BY name');
  return result.rows;
}

export async function listPlayers() {
  const result = await query(
    `SELECT p.id, p.code, p.name, p.gender, p.dob, p.rating, p.tier, p.profile_status,
            c.id AS club_id, c.name AS club_name
       FROM players p
       JOIN clubs c ON c.id = p.club_id
      WHERE p.deleted_at IS NULL
      ORDER BY p.rating DESC, p.name`
  );
  return result.rows;
}

export async function listReferees() {
  const result = await query('SELECT id, code, name, cert, phone, created_at FROM referees ORDER BY name');
  return result.rows;
}

export async function createPlayer({ code, clubId, name, gender, dob, rating = 0, tier, note }) {
  const result = await query(
    `INSERT INTO players (code, club_id, name, gender, dob, rating, tier, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, code, club_id, name, gender, dob, rating, tier, profile_status, note, created_at`,
    [code || null, clubId, name, gender, dob || null, rating, tier || null, note || null]
  );
  return result.rows[0];
}
