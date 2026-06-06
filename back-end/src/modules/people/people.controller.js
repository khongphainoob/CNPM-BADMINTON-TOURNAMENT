import {
  listClubs, createClub, updateClub,
  listPlayers, getPlayerById, createPlayer, updatePlayer, deletePlayer,
  approvePlayer, linkPlayerUser,
  listReferees, getRefereeById, createReferee, updateReferee,
  listCoaches, createCoach
} from './people.service.js';
import { success, created, successList, noContent } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export function getHealth(_req, res) {
  res.json({ module: 'people', status: 'ok' });
}

// ─── Clubs ──────────────────────────────────────────

export async function getClubs(_req, res, next) {
  try {
    return success(res, await listClubs());
  } catch (e) { return next(e); }
}

export async function postClub(req, res, next) {
  try {
    const club = await createClub(req.body);
    if (req.user && (req.user.role === 'coach' || req.user.roles?.includes('coach'))) {
      const { query } = await import('../../config/db.js');
      const existing = await query('SELECT id FROM coaches WHERE user_id = $1', [req.user.id]);
      if (existing.rows[0]) {
        await query('UPDATE coaches SET club_id = $1 WHERE user_id = $2', [club.id, req.user.id]);
      } else {
        const userRes = await query('SELECT name, phone FROM users WHERE id = $1', [req.user.id]);
        const userName = userRes.rows[0]?.name || 'Trưởng Đoàn';
        const userPhone = userRes.rows[0]?.phone || null;
        await createCoach({ name: userName, clubId: club.id, userId: req.user.id, phone: userPhone });
      }
    }
    return created(res, club);
  } catch (e) { return next(e); }
}

export async function putClub(req, res, next) {
  try {
    const club = await updateClub(req.params.id, req.body);
    if (!club) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Club not found' } });
    return success(res, club);
  } catch (e) { return next(e); }
}

// ─── Players ────────────────────────────────────────

export async function getPlayers(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const { clubId, status, search, userId } = req.query;
    const result = await listPlayers({ page, limit, clubId, status, search, userId });
    return successList(res, result, { page, limit });
  } catch (e) { return next(e); }
}

export async function getPlayer(req, res, next) {
  try {
    const player = await getPlayerById(req.params.id);
    if (!player) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Player not found' } });
    return success(res, player);
  } catch (e) { return next(e); }
}

export async function postPlayer(req, res, next) {
  try {
    const data = req.body;
    if (req.user?.role === 'athlete') {
      data.userId = req.user.id;
    }
    return created(res, await createPlayer(data));
  } catch (e) { return next(e); }
}

export async function putPlayer(req, res, next) {
  try {
    const player = await updatePlayer(req.params.id, req.body);
    if (!player) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Player not found' } });
    return success(res, player);
  } catch (e) { return next(e); }
}

export async function removePlayer(req, res, next) {
  try {
    const deleted = await deletePlayer(req.params.id);
    if (!deleted) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Player not found' } });
    return noContent(res);
  } catch (e) { return next(e); }
}

export async function patchApprovePlayer(req, res, next) {
  try {
    return success(res, await approvePlayer(req.params.id));
  } catch (e) { return next(e); }
}

export async function postLinkPlayerUser(req, res, next) {
  try {
    return success(res, await linkPlayerUser(req.params.id, req.body.userId));
  } catch (e) { return next(e); }
}

// ─── Referees ───────────────────────────────────────

export async function getReferees(_req, res, next) {
  try {
    return success(res, await listReferees());
  } catch (e) { return next(e); }
}

export async function getReferee(req, res, next) {
  try {
    const ref = await getRefereeById(req.params.id);
    if (!ref) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Referee not found' } });
    return success(res, ref);
  } catch (e) { return next(e); }
}

export async function postReferee(req, res, next) {
  try {
    return created(res, await createReferee(req.body));
  } catch (e) { return next(e); }
}

export async function putReferee(req, res, next) {
  try {
    const ref = await updateReferee(req.params.id, req.body);
    if (!ref) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Referee not found' } });
    return success(res, ref);
  } catch (e) { return next(e); }
}

// ─── Coaches ────────────────────────────────────────

export async function getCoaches(_req, res, next) {
  try {
    return success(res, await listCoaches());
  } catch (e) { return next(e); }
}

export async function postCoach(req, res, next) {
  try {
    return created(res, await createCoach(req.body));
  } catch (e) { return next(e); }
}
