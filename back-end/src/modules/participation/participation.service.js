import { query } from '../../config/db.js';
import { AppError } from '../../middleware/error.js';

export async function listParticipants(eventId, { page = 1, limit = 20, status } = {}) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (eventId) {
    conditions.push(`ep.event_id = $${idx++}`);
    params.push(eventId);
  }
  if (status) {
    conditions.push(`ep.status = $${idx++}`);
    params.push(status);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (page - 1) * limit;

  const [rows, countResult] = await Promise.all([
    query(
      `SELECT ep.id, ep.event_id, ep.seed, ep.status, ep.registered_at,
              p.id AS player_id, p.code AS player_code, p.name AS player_name,
              p.gender, p.rating, p.tier,
              c.id AS club_id, c.name AS club_name, c.code AS club_code,
              pp.id AS partner_id, pp.code AS partner_code, pp.name AS partner_name,
              e.category_code
         FROM event_participants ep
         JOIN players p ON p.id = ep.player_id
         JOIN clubs c ON c.id = p.club_id
         LEFT JOIN players pp ON pp.id = ep.partner_id
         LEFT JOIN events e ON e.id = ep.event_id
        ${where}
        ORDER BY ep.seed NULLS LAST, p.rating DESC
        LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    ),
    query(
      `SELECT COUNT(*)::int AS total FROM event_participants ep ${where}`,
      params
    )
  ]);

  return { items: rows.rows, total: countResult.rows[0]?.total || 0 };
}

export async function getParticipantById(id) {
  const result = await query(
    `SELECT ep.*, p.name AS player_name, p.code AS player_code,
            pp.name AS partner_name, pp.code AS partner_code
       FROM event_participants ep
       JOIN players p ON p.id = ep.player_id
       LEFT JOIN players pp ON pp.id = ep.partner_id
      WHERE ep.id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function registerPlayer(eventId, { playerId, partnerId, seed }) {
  // Validate event exists and get category info
  const eventResult = await query(
    `SELECT e.id, e.category_code, c.is_doubles
       FROM events e
       JOIN categories c ON c.code = e.category_code
      WHERE e.id = $1`,
    [eventId]
  );
  const event = eventResult.rows[0];
  if (!event) throw new AppError(404, 'Event not found', 'NOT_FOUND');

  // Validate tournament status is open for registration
  const tourStatusResult = await query(
    `SELECT t.status FROM tournaments t 
       JOIN events e ON e.tournament_id = t.id 
      WHERE e.id = $1`,
    [eventId]
  );
  const tourStatus = tourStatusResult.rows[0]?.status;
  if (tourStatus && ['finished', 'cancelled'].includes(tourStatus)) {
    throw new AppError(400, 'Giải đấu không ở trạng thái cho phép đăng ký', 'REGISTRATION_CLOSED');
  }

  // Validate player exists
  const player = await query('SELECT id, gender FROM players WHERE id = $1 AND deleted_at IS NULL', [playerId]);
  if (!player.rows[0]) throw new AppError(404, 'Player not found', 'PLAYER_NOT_FOUND');

  // Check duplicate
  const dup = await query(
    'SELECT id FROM event_participants WHERE event_id = $1 AND (player_id = $2 OR partner_id = $2)',
    [eventId, playerId]
  );
  if (dup.rows[0]) throw new AppError(409, 'VĐV đã đăng ký nội dung này', 'DUPLICATE_REGISTRATION');

  // Doubles validation
  let partner = null;
  if (event.is_doubles) {
    if (!partnerId) throw new AppError(400, 'Nội dung đôi cần có partner', 'PARTNER_REQUIRED');
    if (partnerId === playerId) throw new AppError(400, 'Partner không thể là chính mình', 'SAME_PLAYER');

    const partnerResult = await query('SELECT id, gender, user_id FROM players WHERE id = $1 AND deleted_at IS NULL', [partnerId]);
    partner = partnerResult.rows[0];
    if (!partner) throw new AppError(404, 'Partner not found', 'PARTNER_NOT_FOUND');

    // Mixed doubles: must be different genders
    if (event.category_code === 'XD' && player.rows[0].gender === partner.gender) {
      throw new AppError(400, 'Đôi nam nữ phải gồm 1 nam và 1 nữ', 'MIXED_GENDER_REQUIRED');
    }
  }

  let status = 'registered';
  if (event.is_doubles && partnerId) {
    status = 'pending_partner';
  }

  const result = await query(
    `INSERT INTO event_participants (event_id, player_id, partner_id, seed, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [eventId, playerId, partnerId || null, seed || null, status]
  );
  
  // Create Notification if partner has user_id
  if (status === 'pending_partner' && partner && partner.user_id) {
    await query(
      `INSERT INTO notifications (user_id, channel, subject, body, meta)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        partner.user_id, 
        'in_app', 
        'Yêu cầu xác nhận đánh cặp', 
        `VĐV có ID ${playerId} đã mời bạn đánh cặp tại sự kiện ID ${eventId}. Vui lòng xác nhận.`,
        JSON.stringify({ type: 'partner_invite', eventId, participantId: result.rows[0].id })
      ]
    );
  }

  return result.rows[0];
}

export async function updateParticipantStatus(id, status) {
  const result = await query(
    `UPDATE event_participants SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  if (!result.rows[0]) throw new AppError(404, 'Participant not found', 'NOT_FOUND');

  if (status === 'approved') {
    const ep = result.rows[0];
    
    // Find the user_id associated with the player
    const playerRes = await query('SELECT user_id FROM players WHERE id = $1', [ep.player_id]);
    const userId = playerRes.rows[0]?.user_id;

    // Get event label for note
    const eventRes = await query('SELECT label FROM events WHERE id = $1', [ep.event_id]);
    const eventLabel = eventRes.rows[0]?.label || '';

    // Check if a payment for this participant already exists
    const existingPayment = await query(
      'SELECT id FROM payments WHERE event_participant_id = $1 AND purpose = \'registration_fee\'',
      [id]
    );

    if (existingPayment.rows.length === 0) {
      await query(
        `INSERT INTO payments (code, user_id, event_participant_id, amount, purpose, status, note)
         VALUES ($1, $2, $3, $4, 'registration_fee', 'pending', $5)`,
        [
          `PAY-REG-${id}-${Date.now().toString().slice(-4)}`,
          userId || null,
          id,
          300000, // 300k VND
          `Lệ phí đăng ký: ${eventLabel}`
        ]
      );
    }
  }

  return result.rows[0];
}

export async function assignSeed(id, seed) {
  const result = await query(
    'UPDATE event_participants SET seed = $1 WHERE id = $2 RETURNING *',
    [seed, id]
  );
  if (!result.rows[0]) throw new AppError(404, 'Participant not found', 'NOT_FOUND');
  return result.rows[0];
}

export async function autoSeed(eventId) {
  const participants = await query(
    `SELECT ep.id, p.rating
       FROM event_participants ep
       JOIN players p ON p.id = ep.player_id
      WHERE ep.event_id = $1
      ORDER BY p.rating DESC`,
    [eventId]
  );

  for (let i = 0; i < participants.rows.length; i++) {
    await query(
      'UPDATE event_participants SET seed = $1 WHERE id = $2',
      [i + 1, participants.rows[i].id]
    );
  }

  return { updated: participants.rows.length };
}

export async function withdrawParticipant(id) {
  const result = await query(
    `DELETE FROM event_participants WHERE id = $1 RETURNING id`,
    [id]
  );
  return !!result.rows[0];
}

export async function confirmPartner(participantId, userId) {
  // Check if participant exists and partner is the current user
  const result = await query(
    `SELECT ep.*, p.user_id as partner_user_id 
       FROM event_participants ep
       JOIN players p ON p.id = ep.partner_id
      WHERE ep.id = $1`,
    [participantId]
  );
  const ep = result.rows[0];
  if (!ep) throw new AppError(404, 'Participant not found');
  if (ep.partner_user_id !== userId) throw new AppError(403, 'Bạn không phải là partner được mời', 'FORBIDDEN');
  if (ep.status !== 'pending_partner') throw new AppError(400, 'Không ở trạng thái chờ xác nhận', 'INVALID_STATUS');

  const updated = await query(
    `UPDATE event_participants SET status = 'registered' WHERE id = $1 RETURNING *`,
    [participantId]
  );

  // Notify the original player
  const playerResult = await query('SELECT user_id FROM players WHERE id = $1', [ep.player_id]);
  const playerUserId = playerResult.rows[0]?.user_id;
  if (playerUserId) {
    await query(
      `INSERT INTO notifications (user_id, channel, subject, body, meta)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        playerUserId, 'in_app', 'Đồng đội đã xác nhận',
        `Partner của bạn đã xác nhận tham gia nội dung đôi!`,
        JSON.stringify({ type: 'partner_confirmed', eventId: ep.event_id })
      ]
    );
  }

  return updated.rows[0];
}

export async function rejectPartner(participantId, userId) {
  const result = await query(
    `SELECT ep.*, p.user_id as partner_user_id 
       FROM event_participants ep
       JOIN players p ON p.id = ep.partner_id
      WHERE ep.id = $1`,
    [participantId]
  );
  const ep = result.rows[0];
  if (!ep) throw new AppError(404, 'Participant not found');
  if (ep.partner_user_id !== userId) throw new AppError(403, 'Bạn không phải là partner được mời', 'FORBIDDEN');
  
  // Delete the pending participant
  await query('DELETE FROM event_participants WHERE id = $1', [participantId]);

  // Notify the original player
  const playerResult = await query('SELECT user_id FROM players WHERE id = $1', [ep.player_id]);
  const playerUserId = playerResult.rows[0]?.user_id;
  if (playerUserId) {
    await query(
      `INSERT INTO notifications (user_id, channel, subject, body, meta)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        playerUserId, 'in_app', 'Đồng đội đã từ chối',
        `Partner của bạn đã từ chối tham gia nội dung đôi. Vui lòng đăng ký lại.`,
        JSON.stringify({ type: 'partner_rejected', eventId: ep.event_id })
      ]
    );
  }
}
