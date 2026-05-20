import { query } from '../../config/db.js';

export async function listEventParticipants(eventId) {
  const result = await query(
    `SELECT ep.id, ep.event_id, ep.seed, ep.status, ep.registered_at,
            p.id AS player_id, p.name AS player_name, p.code AS player_code,
            partner.id AS partner_id, partner.name AS partner_name, partner.code AS partner_code
       FROM event_participants ep
       JOIN players p ON p.id = ep.player_id
       LEFT JOIN players partner ON partner.id = ep.partner_id
      WHERE ep.event_id = $1
      ORDER BY ep.seed NULLS LAST, ep.registered_at`,
    [eventId]
  );
  return result.rows;
}

export async function registerEventParticipant({ eventId, playerId, partnerId, seed }) {
  const result = await query(
    `INSERT INTO event_participants (event_id, player_id, partner_id, seed)
     VALUES ($1, $2, $3, $4)
     RETURNING id, event_id, player_id, partner_id, seed, status, registered_at`,
    [eventId, playerId, partnerId || null, seed || null]
  );
  return result.rows[0];
}
