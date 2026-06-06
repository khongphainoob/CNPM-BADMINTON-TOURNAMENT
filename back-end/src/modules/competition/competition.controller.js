import {
  listMatches, getMatchById, createMatch, updateMatch,
  scheduleMatch, startMatch, completeMatch, addMatchParticipant,
  addSetScore, addScoreEvent, listScoreEvents, undoLastScore,
  generateRandomDraw
} from './competition.service.js';
import { success, created, successList, noContent } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export function getHealth(_req, res) {
  res.json({ module: 'competition', status: 'ok' });
}

export async function getMatches(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const eventId = req.query.eventId || req.query.event_id;
    const tournamentId = req.query.tournamentId || req.query.tournament_id;
    const status = req.query.status;
    const courtId = req.query.courtId || req.query.court_id;
    const refereeId = req.query.refereeId || req.query.referee_id;
    const playerId = req.query.playerId || req.query.player_id;
    const result = await listMatches({ eventId, tournamentId, status, courtId, refereeId, playerId, page, limit });
    return successList(res, result, { page, limit });
  } catch (e) { return next(e); }
}

export async function getMatch(req, res, next) {
  try {
    const match = await getMatchById(req.params.id);
    if (!match) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Match not found' } });
    return success(res, match);
  } catch (e) { return next(e); }
}

export async function postMatch(req, res, next) {
  try { return created(res, await createMatch(req.body)); }
  catch (e) { return next(e); }
}

export async function putMatch(req, res, next) {
  try { return success(res, await updateMatch(req.params.id, req.body)); }
  catch (e) { return next(e); }
}

export async function patchSchedule(req, res, next) {
  try { return success(res, await scheduleMatch(req.params.id, req.body)); }
  catch (e) { return next(e); }
}

export async function patchStart(req, res, next) {
  try { return success(res, await startMatch(req.params.id)); }
  catch (e) { return next(e); }
}

export async function patchComplete(req, res, next) {
  try { return success(res, await completeMatch(req.params.id)); }
  catch (e) { return next(e); }
}

export async function postParticipant(req, res, next) {
  try { return created(res, await addMatchParticipant(req.params.id, req.body)); }
  catch (e) { return next(e); }
}

export async function postSetScore(req, res, next) {
  try { return success(res, await addSetScore(req.params.id, req.body)); }
  catch (e) { return next(e); }
}

export async function postScoreEvent(req, res, next) {
  try { return created(res, await addScoreEvent(req.params.id, req.body)); }
  catch (e) { return next(e); }
}

export async function getScoreEvents(req, res, next) {
  try { return success(res, await listScoreEvents(req.params.id)); }
  catch (e) { return next(e); }
}

export async function postUndoScore(req, res, next) {
  try {
    await undoLastScore(req.params.id);
    return success(res, { message: 'Undo thành công' });
  } catch (e) { return next(e); }
}

export async function postGenerateDraw(req, res, next) {
  try {
    return created(res, await generateRandomDraw(req.params.id));
  } catch (e) { return next(e); }
}
