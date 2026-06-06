import {
  listParticipants, getParticipantById, registerPlayer,
  updateParticipantStatus, assignSeed, autoSeed, withdrawParticipant,
  confirmPartner, rejectPartner
} from './participation.service.js';
import { success, created, successList, noContent } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export function getHealth(_req, res) {
  res.json({ module: 'participation', status: 'ok' });
}

export async function getParticipants(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await listParticipants(req.params.eventId, { page, limit });
    return successList(res, result, { page, limit });
  } catch (e) { return next(e); }
}

export async function getParticipant(req, res, next) {
  try {
    const p = await getParticipantById(req.params.id);
    if (!p) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Participant not found' } });
    return success(res, p);
  } catch (e) { return next(e); }
}

import { query } from '../../config/db.js';

export async function postRegistration(req, res, next) {
  try {
    const data = req.body;
    if (req.user?.role === 'athlete') {
      const playerRes = await query('SELECT id FROM players WHERE user_id = $1 LIMIT 1', [req.user.id]);
      if (playerRes.rows.length === 0) {
        return res.status(400).json({ error: { code: 'PLAYER_REQUIRED', message: 'Vui lòng cập nhật Hồ sơ VĐV trước khi đăng ký giải' } });
      }
      data.playerId = playerRes.rows[0].id;
    } else if (!data.playerId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'playerId is required' } });
    }
    return created(res, await registerPlayer(req.params.eventId, data));
  } catch (e) { return next(e); }
}

export async function patchStatus(req, res, next) {
  try { return success(res, await updateParticipantStatus(req.params.id, req.body.status)); }
  catch (e) { return next(e); }
}

export async function postConfirmPartner(req, res, next) {
  try { return success(res, await confirmPartner(req.params.id, req.user.id)); }
  catch (e) { return next(e); }
}

export async function postRejectPartner(req, res, next) {
  try {
    await rejectPartner(req.params.id, req.user.id);
    return noContent(res);
  }
  catch (e) { return next(e); }
}

export async function patchSeed(req, res, next) {
  try {
    return success(res, await assignSeed(req.params.id, req.body.seed));
  } catch (e) { return next(e); }
}

export async function postAutoSeed(req, res, next) {
  try {
    return success(res, await autoSeed(req.params.eventId));
  } catch (e) { return next(e); }
}

export async function deleteParticipant(req, res, next) {
  try {
    const ok = await withdrawParticipant(req.params.id);
    if (!ok) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Participant not found' } });
    return noContent(res);
  } catch (e) { return next(e); }
}
