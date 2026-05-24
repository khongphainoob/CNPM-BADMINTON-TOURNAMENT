import { query } from '../../config/db.js';

export async function listMatches() {
  const result = await query(
    `SELECT m.id, m.code, m.round, m.scheduled_at, m.started_at, m.ended_at,
            m.status, m.winner_side,
            e.id AS event_id, e.label AS event_label, e.category_code,
            t.id AS tournament_id, t.name AS tournament_name,
            c.id AS court_id, c.label AS court_label,
            r.id AS referee_id, r.name AS referee_name
       FROM matches m
       JOIN events e ON e.id = m.event_id
       JOIN tournaments t ON t.id = e.tournament_id
       LEFT JOIN courts c ON c.id = m.court_id
       LEFT JOIN referees r ON r.id = m.referee_id
      WHERE m.deleted_at IS NULL
      ORDER BY m.scheduled_at NULLS LAST, m.id DESC`
  );
  return result.rows;
}

export async function getMatchById(id) {
  const matchResult = await query(
    `SELECT m.id, m.code, m.event_id, m.round, m.court_id, m.referee_id,
            m.scheduled_at, m.started_at, m.ended_at, m.status, m.winner_side
       FROM matches m
      WHERE m.id = $1 AND m.deleted_at IS NULL`,
    [id]
  );

  const match = matchResult.rows[0];
  if (!match) return null;

  const [participantsResult, setsResult] = await Promise.all([
    query(
      `SELECT mp.id, mp.side, mp.seed, p.id AS player_id, p.name AS player_name, p.code AS player_code
         FROM match_participants mp
         JOIN players p ON p.id = mp.player_id
        WHERE mp.match_id = $1
        ORDER BY mp.side, mp.id`,
      [id]
    ),
    query(
      `SELECT id, set_no, score_a, score_b, winner
         FROM match_sets
        WHERE match_id = $1
        ORDER BY set_no`,
      [id]
    )
  ]);

  return {
    ...match,
    participants: participantsResult.rows,
    sets: setsResult.rows
  };
}

export async function createMatch({ eventId, round, courtId, refereeId, scheduledAt, code }) {
  const result = await query(
    `INSERT INTO matches (event_id, round, court_id, referee_id, scheduled_at, code)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, code, event_id, round, court_id, referee_id, scheduled_at, status, created_at`,
    [eventId, round || null, courtId || null, refereeId || null, scheduledAt || null, code || null]
  );
  return result.rows[0];
}
