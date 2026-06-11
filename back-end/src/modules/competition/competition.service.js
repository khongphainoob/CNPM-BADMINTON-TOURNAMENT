import { query, getClient } from '../../config/db.js';
import { AppError } from '../../middleware/error.js';

export async function listMatches({ eventId, tournamentId, status, courtId, refereeId, playerId, page = 1, limit = 50 } = {}) {
  const conditions = ['m.deleted_at IS NULL'];
  const params = [];
  let idx = 1;

  if (eventId) {
    conditions.push(`m.event_id = $${idx++}`);
    params.push(eventId);
  }
  if (tournamentId) {
    conditions.push(`e.tournament_id = $${idx++}`);
    params.push(tournamentId);
  }
  if (status) {
    conditions.push(`m.status = $${idx++}`);
    params.push(status);
  }
  if (courtId) {
    conditions.push(`m.court_id = $${idx++}`);
    params.push(courtId);
  }
  if (refereeId) {
    conditions.push(`m.referee_id = $${idx++}`);
    params.push(refereeId);
  }
  if (playerId) {
    conditions.push(`EXISTS (SELECT 1 FROM match_participants mp WHERE mp.match_id = m.id AND mp.player_id = $${idx++})`);
    params.push(playerId);
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const [matchesResult, countResult] = await Promise.all([
    query(
      `SELECT m.id, m.code, m.round, m.scheduled_at, m.started_at, m.ended_at,
              m.status, m.winner_side, m.result_type,
              e.id AS event_id, e.label AS event_label, e.category_code,
              e.max_sets, e.points_per_set, cat.is_doubles,
              t.id AS tournament_id, t.name AS tournament_name,
              c.id AS court_id, c.label AS court_label,
              r.id AS referee_id, r.name AS referee_name
         FROM matches m
         JOIN events e ON e.id = m.event_id
         JOIN categories cat ON cat.code = e.category_code
         JOIN tournaments t ON t.id = e.tournament_id
         LEFT JOIN courts c ON c.id = m.court_id
         LEFT JOIN referees r ON r.id = m.referee_id
        WHERE ${where}
        ORDER BY m.scheduled_at NULLS LAST, m.id DESC
        LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*)::int AS total FROM matches m LEFT JOIN events e ON e.id = m.event_id WHERE ${where}`, params)
  ]);

  const matches = matchesResult.rows;
  if (matches.length > 0) {
    const matchIds = matches.map(m => m.id);
    const [participantsResult, setsResult] = await Promise.all([
      query(
        `SELECT mp.match_id, mp.id, mp.side, mp.seed, p.id AS player_id, p.name AS player_name, p.code AS player_code, c.name AS club_name
           FROM match_participants mp
           JOIN players p ON p.id = mp.player_id
           LEFT JOIN clubs c ON c.id = p.club_id
          WHERE mp.match_id = ANY($1)
          ORDER BY mp.side, mp.id`,
        [matchIds]
      ),
      query(
        `SELECT match_id, id, set_no, score_a, score_b, winner
           FROM match_sets
          WHERE match_id = ANY($1)
          ORDER BY match_id, set_no`,
        [matchIds]
      )
    ]);
    
    // Group participants and sets by match_id
    const partsByMatch = {};
    for (const p of participantsResult.rows) {
      if (!partsByMatch[p.match_id]) partsByMatch[p.match_id] = [];
      partsByMatch[p.match_id].push({
        id: p.id, side: p.side, seed: p.seed,
        player: { id: p.player_id, code: p.player_code, name: p.player_name, club: p.club_name }
      });
    }

    const setsByMatch = {};
    for (const s of setsResult.rows) {
      if (!setsByMatch[s.match_id]) setsByMatch[s.match_id] = [];
      setsByMatch[s.match_id].push({
        id: s.id, set_no: s.set_no, score_a: s.score_a, score_b: s.score_b, winner: s.winner
      });
    }

    for (const m of matches) {
      m.participants = partsByMatch[m.id] || [];
      m.sets = setsByMatch[m.id] || [];
    }
  }

  return { items: matches, total: countResult.rows[0]?.total || 0 };
}

export async function getMatchById(id) {
  const matchResult = await query(
    `SELECT m.id, m.code, m.event_id, m.round, m.court_id, m.referee_id,
            m.scheduled_at, m.started_at, m.ended_at, m.status, m.winner_side,
            e.category_code, e.max_sets, e.points_per_set
       FROM matches m
       JOIN events e ON e.id = m.event_id
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

export async function updateMatch(id, data) {
  const fieldMap = { courtId: 'court_id', refereeId: 'referee_id', scheduledAt: 'scheduled_at', status: 'status' };
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
    `UPDATE matches SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
    values
  );
  if (!result.rows[0]) throw new AppError(404, 'Match not found', 'NOT_FOUND');
  return result.rows[0];
}

export async function scheduleMatch(id, { courtId, scheduledAt, refereeId, estimatedDurationMins }) {
  return updateMatch(id, { courtId, scheduledAt, refereeId, estimatedDurationMins });
}

export async function startMatch(id) {
  const match = await getMatchById(id);
  if (!match) throw new AppError(404, 'Match not found', 'NOT_FOUND');
  if (match.status !== 'upcoming') throw new AppError(400, 'Chỉ có thể bắt đầu trận đấu upcoming', 'INVALID_STATE');

  const result = await query(
    `UPDATE matches SET status = 'live', started_at = now() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

export async function completeMatch(id) {
  const match = await getMatchById(id);
  if (!match) throw new AppError(404, 'Match not found', 'NOT_FOUND');

  // Tính winner (dựa trên số set thắng)
  let setsWonA = 0;
  let setsWonB = 0;
  for (const set of match.sets) {
    if (set.winner === 'A') setsWonA++;
    if (set.winner === 'B') setsWonB++;
  }

  let winnerSide = null;
  const setsToWin = Math.ceil(match.max_sets / 2);
  if (setsWonA >= setsToWin) winnerSide = 'A';
  else if (setsWonB >= setsToWin) winnerSide = 'B';

  const result = await query(
    `UPDATE matches SET status = 'completed', ended_at = now(), winner_side = $1 WHERE id = $2 RETURNING *`,
    [winnerSide, id]
  );

  // Advance the winner into the next round's match (idempotent — safe on retry/replay).
  await advanceWinner({ query }, id);

  return result.rows[0];
}

// Abnormal ending: walkover (opponent absent) or disqualification. Sets winner + advances bracket.
export async function setMatchResult(id, { resultType, winnerSide, note }) {
  const match = await getMatchById(id);
  if (!match) throw new AppError(404, 'Match not found', 'NOT_FOUND');
  if (!['walkover', 'disqualification'].includes(resultType)) {
    throw new AppError(400, 'resultType không hợp lệ', 'INVALID_RESULT_TYPE');
  }

  const result = await query(
    `UPDATE matches
        SET status = 'completed', ended_at = now(), winner_side = $1, result_type = $2
      WHERE id = $3 RETURNING *`,
    [winnerSide, resultType, id]
  );

  if (note) {
    await query(
      `INSERT INTO activity_log (action, target_type, target_id, message)
       VALUES ('match.result', 'match', $1, $2)`,
      [String(id), `${resultType}: ${note}`]
    );
  }

  await advanceWinner({ query }, id);

  return result.rows[0];
}

export async function addMatchParticipant(matchId, { side, playerId, seed }) {
  const result = await query(
    `INSERT INTO match_participants (match_id, side, player_id, seed)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [matchId, side, playerId, seed || null]
  );
  return result.rows[0];
}

export async function addSetScore(matchId, { setNo, scoreA, scoreB }) {
  const match = await getMatchById(matchId);
  if (!match) throw new AppError(404, 'Match not found', 'NOT_FOUND');

  // Logic xác định set winner: ví dụ 21 điểm, deuce (chênh 2 điểm, max 30)
  let winner = null;
  const points = match.points_per_set;
  if ((scoreA >= points || scoreB >= points) && Math.abs(scoreA - scoreB) >= 2) {
    winner = scoreA > scoreB ? 'A' : 'B';
  } else if (scoreA === 30 || scoreB === 30) {
    winner = scoreA === 30 ? 'A' : 'B'; // Cap at 30
  }

  const result = await query(
    `INSERT INTO match_sets (match_id, set_no, score_a, score_b, winner)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (match_id, set_no)
     DO UPDATE SET score_a = EXCLUDED.score_a, score_b = EXCLUDED.score_b, winner = EXCLUDED.winner
     RETURNING *`,
    [matchId, setNo, scoreA, scoreB, winner]
  );

  return result.rows[0];
}

export async function addScoreEvent(matchId, { setNo, scorer, prevScoreA, prevScoreB, prevServing, causedSetEnd }) {
  const result = await query(
    `INSERT INTO score_events (match_id, set_no, scorer, prev_score_a, prev_score_b, prev_serving, caused_set_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [matchId, setNo, scorer, prevScoreA || 0, prevScoreB || 0, prevServing || 'A', causedSetEnd || false]
  );
  return result.rows[0];
}

export async function listScoreEvents(matchId) {
  const result = await query(
    `SELECT * FROM score_events WHERE match_id = $1 ORDER BY created_at ASC`,
    [matchId]
  );
  return result.rows;
}

export async function undoLastScore(matchId) {
  // Tìm event cuối
  const lastEvent = await query(
    `SELECT id FROM score_events WHERE match_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [matchId]
  );
  if (!lastEvent.rows[0]) throw new AppError(400, 'Không có điểm nào để undo', 'NO_SCORE_TO_UNDO');

  await query(`DELETE FROM score_events WHERE id = $1`, [lastEvent.rows[0].id]);
  return true;
}

export async function generateRandomDraw(eventId) {
  // 1. Fetch participants (registered or approved) with seeds
  const partsResult = await query(
    `SELECT id, player_id, partner_id, seed 
       FROM event_participants 
      WHERE event_id = $1 
        AND status IN ('registered', 'approved')
      ORDER BY seed ASC NULLS LAST, id ASC`,
    [eventId]
  );
  
  const participants = partsResult.rows;
  const playerCount = participants.length;

  if (playerCount < 2) {
    throw new AppError(400, 'Không đủ số lượng VĐV để bốc thăm (tối thiểu 2)', 'DRAW_ERROR');
  }

  // 2. Bracket size must be next power of 2
  const bracketSize = nextPowerOf2(playerCount);
  const numByes = bracketSize - playerCount;

  // (Round names are derived per-round below via roundNameForSize.)

  // 3. Separate seeded players and unseeded players
  const seeded = participants.filter(p => p.seed !== null);
  const unseeded = participants.filter(p => p.seed === null);

  // Shuffle unseeded players
  for (let i = unseeded.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unseeded[i], unseeded[j]] = [unseeded[j], unseeded[i]];
  }

  // 4. Initialize slots of size bracketSize
  const slots = Array(bracketSize).fill(null);

  // 5. Place seeded players at standard BWF bracket positions
  if (seeded.length > 0) slots[0] = seeded[0]; // Seed 1
  if (seeded.length > 1) slots[bracketSize - 1] = seeded[1]; // Seed 2
  if (seeded.length > 2) slots[bracketSize / 2 - 1] = seeded[2]; // Seed 3
  if (seeded.length > 3) slots[bracketSize / 2] = seeded[3]; // Seed 4
  
  if (seeded.length > 4) {
    unseeded.push(...seeded.slice(4));
    // reshuffle unseeded
    for (let i = unseeded.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unseeded[i], unseeded[j]] = [unseeded[j], unseeded[i]];
    }
  }

  // 6. Distribute BYEs next to the top seeds
  let byesPlaced = 0;
  if (byesPlaced < numByes && slots[0] !== null) { slots[1] = 'BYE'; byesPlaced++; }
  if (byesPlaced < numByes && slots[bracketSize - 1] !== null) { slots[bracketSize - 2] = 'BYE'; byesPlaced++; }
  if (byesPlaced < numByes && slots[bracketSize / 2 - 1] !== null) { slots[bracketSize / 2 - 2] = 'BYE'; byesPlaced++; }
  if (byesPlaced < numByes && slots[bracketSize / 2] !== null) { slots[bracketSize / 2 + 1] = 'BYE'; byesPlaced++; }

  // 7. Fill the remaining empty slots
  let unseededIdx = 0;
  for (let i = 0; i < bracketSize; i++) {
    if (slots[i] === null) {
      if (unseededIdx < unseeded.length) {
        slots[i] = unseeded[unseededIdx++];
      } else {
        slots[i] = 'BYE';
      }
    }
  }

  // 8. Generate the full bracket tree (every round) and wire winner-advancement links.
  const client = await getClient();
  try {
    await client.query('BEGIN');
    // Detach self-references first so the bulk delete can't trip the FK, then clear.
    await client.query(`UPDATE matches SET next_match_id = NULL WHERE event_id = $1`, [eventId]);
    await client.query(`DELETE FROM matches WHERE event_id = $1`, [eventId]);

    const numRounds = Math.log2(bracketSize);

    // 8a. Create every match across all rounds (empty for now); remember ids per round.
    const rounds = [];
    for (let r = 0; r < numRounds; r++) {
      const playersInRound = bracketSize / Math.pow(2, r);
      const matchesInRound = playersInRound / 2;
      const rName = roundNameForSize(playersInRound);
      const ids = [];
      for (let j = 0; j < matchesInRound; j++) {
        const res = await client.query(
          `INSERT INTO matches (event_id, round, status, code)
           VALUES ($1, $2, 'upcoming', $3) RETURNING id`,
          [eventId, rName, `M-${eventId}-R${r + 1}-${j + 1}`]
        );
        ids.push(res.rows[0].id);
      }
      rounds.push(ids);
    }

    // 8b. Link each match to its successor: winner of match j feeds match floor(j/2).
    for (let r = 0; r < numRounds - 1; r++) {
      for (let j = 0; j < rounds[r].length; j++) {
        const nextId = rounds[r + 1][Math.floor(j / 2)];
        const slot = j % 2 === 0 ? 'A' : 'B';
        await client.query(
          `UPDATE matches SET next_match_id = $1, next_slot = $2 WHERE id = $3`,
          [nextId, slot, rounds[r][j]]
        );
      }
    }

    // 8c. Seat round-1 players; BYE matches auto-complete and advance immediately.
    const insertSide = async (matchId, side, participant) => {
      await client.query(
        `INSERT INTO match_participants (match_id, side, player_id, seed) VALUES ($1, $2, $3, $4)`,
        [matchId, side, participant.player_id, participant.seed]
      );
      if (participant.partner_id) {
        await client.query(
          `INSERT INTO match_participants (match_id, side, player_id, seed) VALUES ($1, $2, $3, $4)`,
          [matchId, side, participant.partner_id, participant.seed]
        );
      }
    };

    for (let j = 0; j < rounds[0].length; j++) {
      const matchId = rounds[0][j];
      const playerA = slots[2 * j];
      const playerB = slots[2 * j + 1];
      const isByeA = playerA === 'BYE' || playerA === null;
      const isByeB = playerB === 'BYE' || playerB === null;

      if (!isByeA) await insertSide(matchId, 'A', playerA);
      if (!isByeB) await insertSide(matchId, 'B', playerB);

      if (isByeA && isByeB) {
        await client.query(`UPDATE matches SET status = 'completed', ended_at = now() WHERE id = $1`, [matchId]);
      } else if (isByeA || isByeB) {
        const winnerSide = isByeA ? 'B' : 'A';
        await client.query(
          `UPDATE matches SET status = 'completed', winner_side = $1, ended_at = now() WHERE id = $2`,
          [winnerSide, matchId]
        );
        await advanceWinner(client, matchId);
      }
    }

    await client.query('COMMIT');
    return { matchesGenerated: bracketSize - 1 };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Insert the winning side's player(s) into the linked next match. Idempotent via ON CONFLICT.
// `executor` is anything with a .query() method (a pg client or the query helper wrapper).
async function advanceWinner(executor, matchId) {
  const info = await executor.query(
    `SELECT next_match_id, next_slot, winner_side FROM matches WHERE id = $1`,
    [matchId]
  );
  const row = info.rows[0];
  if (!row || !row.next_match_id || !row.winner_side) return;

  const winners = await executor.query(
    `SELECT player_id, seed FROM match_participants WHERE match_id = $1 AND side = $2`,
    [matchId, row.winner_side]
  );
  for (const w of winners.rows) {
    await executor.query(
      `INSERT INTO match_participants (match_id, side, player_id, seed)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (match_id, side, player_id) DO NOTHING`,
      [row.next_match_id, row.next_slot, w.player_id, w.seed]
    );
  }
}

function roundNameForSize(size) {
  switch (size) {
    case 2: return 'Chung kết';
    case 4: return 'Bán kết';
    case 8: return 'Tứ kết';
    case 16: return 'Vòng 16';
    case 32: return 'Vòng 32';
    case 64: return 'Vòng 64';
    default: return `Vòng ${size}`;
  }
}

function nextPowerOf2(n) {
  let count = 1;
  while (count < n) {
    count *= 2;
  }
  return count;
}

