import { query, getClient } from '../../config/db.js';
import { AppError } from '../../middleware/error.js';
import { broadcastScoreUpdate } from '../../config/socket.js';

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
              m.status, m.winner_side, m.next_match_id, m.next_match_side,
              e.id AS event_id, e.label AS event_label, e.category_code,
              t.id AS tournament_id, t.name AS tournament_name,
              c.id AS court_id, c.label AS court_label,
              r.id AS referee_id, r.name AS referee_name
         FROM matches m
         JOIN events e ON e.id = m.event_id
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
            m.next_match_id, m.next_match_side,
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

  const client = await getClient();
  let completedMatch;
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE matches SET status = 'completed', ended_at = now(), winner_side = $1 WHERE id = $2 RETURNING *`,
      [winnerSide, id]
    );
    completedMatch = result.rows[0];

    if (completedMatch && winnerSide) {
      await advanceWinner(client, id, winnerSide);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi tự động tiến cử người thắng:', e);
    throw e;
  } finally {
    client.release();
  }

  return completedMatch;
}

export async function advanceWinner(client, matchId, winnerSide) {
  // 1. Fetch match next link details
  const matchRes = await client.query(
    `SELECT next_match_id, next_match_side FROM matches WHERE id = $1`,
    [matchId]
  );
  const match = matchRes.rows[0];
  if (!match || !match.next_match_id) return;

  const nextMatchId = match.next_match_id;
  const nextMatchSide = match.next_match_side;

  // 2. Fetch the winning participants from the current match
  const winnerPartsRes = await client.query(
    `SELECT player_id, seed FROM match_participants WHERE match_id = $1 AND side = $2`,
    [matchId, winnerSide]
  );
  const winningPlayers = winnerPartsRes.rows;
  if (winningPlayers.length === 0) return;

  // 3. Delete any existing participants on nextMatchSide of nextMatchId (to clean up if score was modified)
  await client.query(
    `DELETE FROM match_participants WHERE match_id = $1 AND side = $2`,
    [nextMatchId, nextMatchSide]
  );

  // 4. Insert winning players into next match
  for (const wp of winningPlayers) {
    await client.query(
      `INSERT INTO match_participants (match_id, side, player_id, seed) VALUES ($1, $2, $3, $4)`,
      [nextMatchId, nextMatchSide, wp.player_id, wp.seed]
    );
  }
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
  if (match.status === 'completed') {
    throw new AppError(400, 'Không thể chỉnh sửa điểm số của trận đấu đã hoàn thành', 'MATCH_ALREADY_COMPLETED');
  }

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

  const resRow = result.rows[0];
  broadcastScoreUpdate(matchId, { type: 'set-score', ...resRow });
  return resRow;
}

export async function addScoreEvent(matchId, { setNo, scorer, prevScoreA, prevScoreB, prevServing, causedSetEnd }) {
  const match = await getMatchById(matchId);
  if (!match) throw new AppError(404, 'Match not found', 'NOT_FOUND');
  if (match.status === 'completed') {
    throw new AppError(400, 'Không thể chỉnh sửa điểm số của trận đấu đã hoàn thành', 'MATCH_ALREADY_COMPLETED');
  }

  const result = await query(
    `INSERT INTO score_events (match_id, set_no, scorer, prev_score_a, prev_score_b, prev_serving, caused_set_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [matchId, setNo, scorer, prevScoreA || 0, prevScoreB || 0, prevServing || 'A', causedSetEnd || false]
  );
  const resRow = result.rows[0];
  broadcastScoreUpdate(matchId, { type: 'score-event', ...resRow });
  return resRow;
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
  broadcastScoreUpdate(matchId, { type: 'undo' });
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
  const totalRounds = Math.log2(bracketSize);

  function getRoundName(roundIndex, total) {
    if (roundIndex === total) return 'Chung kết';
    if (roundIndex === total - 1) return 'Bán kết';
    if (roundIndex === total - 2) return 'Tứ kết';
    return `Vòng ${Math.pow(2, total - roundIndex + 1)}`;
  }

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

  // 8. Generate matches
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM matches WHERE event_id = $1`, [eventId]);

    // Keep track of created match IDs in each round: { `${roundIndex}-${matchIndex}`: matchId }
    const createdMatchIds = {};
    let totalMatchesCreated = 0;

    // Create matches round-by-round from final (totalRounds) down to Round 1
    for (let r = totalRounds; r >= 1; r--) {
      const roundName = getRoundName(r, totalRounds);
      const matchesInRound = Math.pow(2, totalRounds - r);

      for (let i = 0; i < matchesInRound; i++) {
        let nextMatchId = null;
        let nextMatchSide = null;

        // If not the final round, link to the next match
        if (r < totalRounds) {
          const nextMatchIndex = Math.floor(i / 2);
          nextMatchId = createdMatchIds[`${r + 1}-${nextMatchIndex}`] || null;
          nextMatchSide = i % 2 === 0 ? 'A' : 'B';
        }

        let status = 'upcoming';
        let winnerSide = null;
        let endedAt = null;

        // If it's the first round, check if any BYEs make it completed
        if (r === 1) {
          const playerA = slots[i * 2];
          const playerB = slots[i * 2 + 1];
          const isByeA = playerA === 'BYE' || playerA === null;
          const isByeB = playerB === 'BYE' || playerB === null;

          if (isByeA) {
            status = 'completed';
            winnerSide = 'B';
            endedAt = 'now()';
          } else if (isByeB) {
            status = 'completed';
            winnerSide = 'A';
            endedAt = 'now()';
          }
        }

        const matchCode = `M-${eventId}-${r}-${i + 1}`;
        const matchRes = await client.query(
          `INSERT INTO matches (event_id, round, status, winner_side, ended_at, code, next_match_id, next_match_side) 
           VALUES ($1, $2, $3, $4, ${endedAt ? 'now()' : 'NULL'}, $5, $6, $7) 
           RETURNING id`,
          [eventId, roundName, status, winnerSide, matchCode, nextMatchId, nextMatchSide]
        );
        const matchId = matchRes.rows[0].id;
        createdMatchIds[`${r}-${i}`] = matchId;
        totalMatchesCreated++;

        // Insert initial participants for Round 1
        if (r === 1) {
          const playerA = slots[i * 2];
          const playerB = slots[i * 2 + 1];
          const isByeA = playerA === 'BYE' || playerA === null;
          const isByeB = playerB === 'BYE' || playerB === null;

          if (!isByeA) {
            await client.query(
              `INSERT INTO match_participants (match_id, side, player_id, seed) VALUES ($1, 'A', $2, $3)`,
              [matchId, playerA.player_id, playerA.seed]
            );
            if (playerA.partner_id) {
              await client.query(
                `INSERT INTO match_participants (match_id, side, player_id, seed) VALUES ($1, 'A', $2, $3)`,
                [matchId, playerA.partner_id, playerA.seed]
              );
            }
          }

          if (!isByeB) {
            await client.query(
              `INSERT INTO match_participants (match_id, side, player_id, seed) VALUES ($1, 'B', $2, $3)`,
              [matchId, playerB.player_id, playerB.seed]
            );
            if (playerB.partner_id) {
              await client.query(
                `INSERT INTO match_participants (match_id, side, player_id, seed) VALUES ($1, 'B', $2, $3)`,
                [matchId, playerB.partner_id, playerB.seed]
              );
            }
          }

          // If completed (due to BYE), auto-advance winner to next round
          if (status === 'completed' && winnerSide && nextMatchId) {
            await advanceWinner(client, matchId, winnerSide);
          }
        }
      }
    }

    await client.query('COMMIT');
    return { matchesGenerated: totalMatchesCreated };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

function nextPowerOf2(n) {
  let count = 1;
  while (count < n) {
    count *= 2;
  }
  return count;
}

