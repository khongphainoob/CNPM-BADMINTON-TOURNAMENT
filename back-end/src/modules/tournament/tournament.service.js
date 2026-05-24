import { query } from '../../config/db.js';

export async function listTournaments() {
  const result = await query(
    `SELECT t.id, t.code, t.name, t.name_en, t.start_date, t.end_date, t.status, t.format,
            t.budget, t.revenue, v.id AS venue_id, v.name AS venue_name, v.province
       FROM tournaments t
       LEFT JOIN venues v ON v.id = t.venue_id
      ORDER BY t.start_date DESC, t.id DESC`
  );
  return result.rows;
}

export async function getTournamentById(id) {
  const result = await query(
    `SELECT t.id, t.code, t.name, t.name_en, t.start_date, t.end_date, t.status, t.format,
            t.budget, t.revenue, v.id AS venue_id, v.name AS venue_name, v.address, v.province
       FROM tournaments t
       LEFT JOIN venues v ON v.id = t.venue_id
      WHERE t.id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function listTournamentEvents(tournamentId) {
  const result = await query(
    `SELECT e.id, e.tournament_id, e.category_code, c.label AS category_label, c.is_doubles,
            e.label, e.max_sets, e.points_per_set, e.created_at
       FROM events e
       JOIN categories c ON c.code = e.category_code
      WHERE e.tournament_id = $1
      ORDER BY e.category_code`,
    [tournamentId]
  );
  return result.rows;
}

export async function listTournamentCourts(tournamentId) {
  const result = await query(
    `SELECT id, tournament_id, label, floor, status, updated_at
       FROM courts
      WHERE tournament_id = $1
      ORDER BY label`,
    [tournamentId]
  );
  return result.rows;
}
