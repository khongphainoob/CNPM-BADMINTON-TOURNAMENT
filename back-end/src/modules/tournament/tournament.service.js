import { query } from '../../config/db.js';
import { AppError } from '../../middleware/error.js';

// Valid state transitions
const VALID_TRANSITIONS = {
  draft: ['live', 'cancelled'],
  live: ['finished', 'cancelled'],
  finished: [],
  cancelled: ['draft']
};

// ─── Tournaments ────────────────────────────────────

export async function listTournaments(query_params = {}) {
  const { ownerId } = query_params;
  const params = [];
  let whereClause = '';
  
  if (ownerId) {
    params.push(ownerId);
    whereClause = 'WHERE t.created_by = $1';
  }

  const result = await query(
    `SELECT t.id, t.code, t.name, t.name_en, t.start_date, t.end_date, t.status, t.format,
            t.budget, t.revenue, t.created_by, v.id AS venue_id, v.name AS venue_name, v.province
       FROM tournaments t
       LEFT JOIN venues v ON v.id = t.venue_id
       ${whereClause}
      ORDER BY t.start_date DESC, t.id DESC`,
    params
  );
  return result.rows;
}

export async function getTournamentById(id) {
  const result = await query(
    `SELECT t.id, t.code, t.name, t.name_en, t.start_date, t.end_date, t.status, t.format,
            t.budget, t.revenue, t.created_by, v.id AS venue_id, v.name AS venue_name, v.address, v.province
       FROM tournaments t
       LEFT JOIN venues v ON v.id = t.venue_id
      WHERE t.id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function createTournament({ code, name, nameEn, venueId, startDate, endDate, format, budget }, ownerId) {
  if (new Date(endDate) < new Date(startDate)) {
    throw new AppError(400, 'Ngày kết thúc phải sau ngày bắt đầu', 'INVALID_DATES');
  }

  const result = await query(
    `INSERT INTO tournaments (code, name, name_en, venue_id, start_date, end_date, format, budget, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [code, name, nameEn || null, venueId || null, startDate, endDate, format || null, budget || 0, ownerId || null]
  );
  return result.rows[0];
}

export async function updateTournament(id, data) {
  const tournament = await getTournamentById(id);
  if (!tournament) throw new AppError(404, 'Tournament not found', 'NOT_FOUND');

  const fieldMap = {
    code: 'code', name: 'name', nameEn: 'name_en', venueId: 'venue_id',
    startDate: 'start_date', endDate: 'end_date', format: 'format',
    budget: 'budget', revenue: 'revenue'
  };

  const fields = [];
  const values = [];
  let idx = 1;

  for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
    if (data[jsKey] !== undefined) {
      fields.push(`${dbKey} = $${idx++}`);
      values.push(data[jsKey]);
    }
  }
  if (fields.length === 0) throw new AppError(400, 'Không có dữ liệu cập nhật', 'NO_DATA');

  values.push(id);
  const result = await query(
    `UPDATE tournaments SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function changeTournamentStatus(id, newStatus, userId) {
  const tournament = await getTournamentById(id);
  if (!tournament) throw new AppError(404, 'Tournament not found', 'NOT_FOUND');

  const allowed = VALID_TRANSITIONS[tournament.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(422, `Không thể chuyển từ "${tournament.status}" sang "${newStatus}"`, 'INVALID_TRANSITION');
  }

  await query('UPDATE tournaments SET status = $1 WHERE id = $2', [newStatus, id]);

  // Log status change to activity_log
  await query(
    `INSERT INTO activity_log (actor_user_id, action, target_type, target_id, message, meta)
     VALUES ($1, 'tournament.status.change', 'tournament', $2, $3, $4)`,
    [
      userId || null,
      String(id),
      `Đổi trạng thái giải từ "${tournament.status}" sang "${newStatus}"`,
      JSON.stringify({ from: tournament.status, to: newStatus })
    ]
  );

  return getTournamentById(id);
}

export async function deleteTournament(id) {
  // Soft-delete is not in schema — just delete if draft
  const tournament = await getTournamentById(id);
  if (!tournament) throw new AppError(404, 'Tournament not found', 'NOT_FOUND');
  if (tournament.status !== 'draft') {
    throw new AppError(422, 'Chỉ có thể xóa giải ở trạng thái draft', 'CANNOT_DELETE');
  }
  await query('DELETE FROM tournaments WHERE id = $1', [id]);
  return true;
}

// ─── Events ─────────────────────────────────────────

export async function listTournamentEvents(tournamentId) {
  const result = await query(
    `SELECT e.id, e.tournament_id, e.category_code, c.label AS category_label, c.is_doubles,
            e.label, e.max_sets, e.points_per_set, e.created_at,
            e.content_type, e.gender, e.age_group, e.max_participants, e.registration_start, e.registration_end,
            COUNT(ep.id)::int AS participant_count
       FROM events e
       JOIN categories c ON c.code = e.category_code
       LEFT JOIN event_participants ep ON ep.event_id = e.id
      WHERE e.tournament_id = $1
      GROUP BY e.id, c.label, c.is_doubles
      ORDER BY e.category_code`,
    [tournamentId]
  );
  return result.rows;
}

export async function createEvent(tournamentId, { categoryCode, label, maxSets, pointsPerSet, contentType, gender, ageGroup, maxParticipants, registrationStart, registrationEnd }) {
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) throw new AppError(404, 'Tournament not found', 'NOT_FOUND');
  if (tournament.status === 'live' || tournament.status === 'finished') {
    throw new AppError(422, 'Không thể thêm hạng mục khi giải đã bắt đầu hoặc kết thúc', 'INVALID_STATUS');
  }

  const existingEvents = await listTournamentEvents(tournamentId);
  if (existingEvents.length >= 10) {
    throw new AppError(422, 'Chỉ được phép cấu hình tối đa 10 hạng mục cho mỗi giải đấu', 'MAX_EVENTS_REACHED');
  }

  const result = await query(
    `INSERT INTO events (tournament_id, category_code, label, max_sets, points_per_set, content_type, gender, age_group, max_participants, registration_start, registration_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      tournamentId, categoryCode, label || null, maxSets || 3, pointsPerSet || 21,
      contentType || null, gender || null, ageGroup || null, maxParticipants || 64,
      registrationStart || null, registrationEnd || null
    ]
  );
  return result.rows[0];
}

export async function updateEvent(tournamentId, eventId, data) {
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) throw new AppError(404, 'Tournament not found', 'NOT_FOUND');
  if (tournament.status === 'live' || tournament.status === 'finished') {
    throw new AppError(422, 'Không thể sửa hạng mục khi giải đã bắt đầu hoặc kết thúc', 'INVALID_STATUS');
  }

  const fieldMap = { categoryCode: 'category_code', label: 'label', maxSets: 'max_sets', pointsPerSet: 'points_per_set', contentType: 'content_type', gender: 'gender', ageGroup: 'age_group', maxParticipants: 'max_participants', registrationStart: 'registration_start', registrationEnd: 'registration_end' };
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
    if (data[jsKey] !== undefined) {
      fields.push(`${dbKey} = $${idx++}`);
      values.push(data[jsKey]);
    }
  }
  if (fields.length === 0) throw new AppError(400, 'Không có dữ liệu cập nhật', 'NO_DATA');

  values.push(eventId, tournamentId);
  const result = await query(
    `UPDATE events SET ${fields.join(', ')} WHERE id = $${idx++} AND tournament_id = $${idx}
     RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteEvent(tournamentId, eventId) {
  const result = await query(
    'DELETE FROM events WHERE id = $1 AND tournament_id = $2 RETURNING id',
    [eventId, tournamentId]
  );
  return !!result.rows[0];
}

// ─── Venues ─────────────────────────────────────────

export async function listVenues() {
  const result = await query('SELECT id, name, address, province, created_at FROM venues ORDER BY name');
  return result.rows;
}

export async function createVenue({ name, address, province }) {
  const result = await query(
    'INSERT INTO venues (name, address, province) VALUES ($1, $2, $3) RETURNING *',
    [name, address || null, province || null]
  );
  return result.rows[0];
}

// ─── Courts ─────────────────────────────────────────

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

export async function createCourt(tournamentId, { label, floor, status }) {
  const result = await query(
    `INSERT INTO courts (tournament_id, label, floor, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [tournamentId, label, floor || null, status || 'idle']
  );
  return result.rows[0];
}

export async function updateCourtStatus(tournamentId, courtId, status) {
  const result = await query(
    `UPDATE courts SET status = $1 WHERE id = $2 AND tournament_id = $3 RETURNING *`,
    [status, courtId, tournamentId]
  );
  return result.rows[0];
}

export async function updateCourt(tournamentId, courtId, { label, floor }) {
  const result = await query(
    `UPDATE courts SET label = COALESCE($1, label), floor = COALESCE($2, floor)
     WHERE id = $3 AND tournament_id = $4 RETURNING *`,
    [label, floor, courtId, tournamentId]
  );
  return result.rows[0];
}

export async function deleteCourt(tournamentId, courtId) {
  const result = await query(
    'DELETE FROM courts WHERE id = $1 AND tournament_id = $2 RETURNING id',
    [courtId, tournamentId]
  );
  return !!result.rows[0];
}

// ─── Dashboard ──────────────────────────────────────

export async function getTournamentDashboard(tournamentId) {
  const [tournament, events, courts, matchStats, participantCount] = await Promise.all([
    getTournamentById(tournamentId),
    listTournamentEvents(tournamentId),
    listTournamentCourts(tournamentId),
    query(
      `SELECT status, COUNT(*)::int AS count
         FROM matches m
         JOIN events e ON e.id = m.event_id
        WHERE e.tournament_id = $1 AND m.deleted_at IS NULL
        GROUP BY status`,
      [tournamentId]
    ),
    query(
      `SELECT COUNT(DISTINCT ep.player_id)::int AS total
         FROM event_participants ep
         JOIN events e ON e.id = ep.event_id
        WHERE e.tournament_id = $1`,
      [tournamentId]
    )
  ]);

  if (!tournament) throw new AppError(404, 'Tournament not found', 'NOT_FOUND');

  const matchesByStatus = {};
  for (const row of matchStats.rows) {
    matchesByStatus[row.status] = row.count;
  }

  return {
    tournament,
    events,
    courts,
    stats: {
      totalEvents: events.length,
      totalCourts: courts.length,
      totalPlayers: participantCount.rows[0]?.total || 0,
      courtsActive: courts.filter(c => c.status === 'live').length,
      matches: {
        upcoming: matchesByStatus.upcoming || 0,
        live: matchesByStatus.live || 0,
        completed: matchesByStatus.completed || 0,
        cancelled: matchesByStatus.cancelled || 0,
        total: Object.values(matchesByStatus).reduce((a, b) => a + b, 0)
      }
    }
  };
}
