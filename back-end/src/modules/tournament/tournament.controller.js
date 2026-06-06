import {
  listTournaments, getTournamentById, createTournament, updateTournament,
  changeTournamentStatus, deleteTournament,
  listTournamentEvents, createEvent, updateEvent, deleteEvent,
  listVenues, createVenue,
  listTournamentCourts, createCourt, updateCourtStatus, updateCourt, deleteCourt,
  getTournamentDashboard
} from './tournament.service.js';
import { query } from '../../config/db.js';
import { success, created, noContent } from '../../utils/response.js';

export function getHealth(_req, res) {
  res.json({ module: 'tournament', status: 'ok' });
}

// ─── Tournaments ────────────────────────────────────

async function resolveId(idOrCode) {
  if (!isNaN(idOrCode)) return idOrCode;
  const res = await query('SELECT id FROM tournaments WHERE code = $1', [idOrCode]);
  return res.rows[0]?.id || idOrCode;
}

export async function getTournaments(req, res, next) {
  try { return success(res, await listTournaments(req.query)); }
  catch (e) { return next(e); }
}

export async function getTournament(req, res, next) {
  try {
    const id = await resolveId(req.params.id);
    const t = await getTournamentById(id);
    if (!t) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Tournament not found' } });
    return success(res, t);
  } catch (e) { return next(e); }
}

export async function postTournament(req, res, next) {
  try { return created(res, await createTournament(req.body, req.user?.id)); }
  catch (e) { return next(e); }
}

export async function putTournament(req, res, next) {
  try {
    const id = await resolveId(req.params.id);
    const t = await updateTournament(id, req.body);
    return success(res, t);
  } catch (e) { return next(e); }
}

export async function removeTournament(req, res, next) {
  try {
    const id = await resolveId(req.params.id);
    await deleteTournament(id);
    return noContent(res);
  } catch (e) { return next(e); }
}

export async function patchStatus(req, res, next) {
  try {
    const id = await resolveId(req.params.id);
    const t = await changeTournamentStatus(id, req.body.status, req.user?.id);
    return success(res, t);
  } catch (e) { return next(e); }
}

// ─── Events ─────────────────────────────────────────

export async function getEvents(req, res, next) {
  try { 
    const id = await resolveId(req.params.id);
    return success(res, await listTournamentEvents(id)); 
  }
  catch (e) { return next(e); }
}

export async function postEvent(req, res, next) {
  try { 
    const id = await resolveId(req.params.id);
    return created(res, await createEvent(id, req.body)); 
  }
  catch (e) { return next(e); }
}

export async function putEvent(req, res, next) {
  try {
    const e = await updateEvent(req.params.id, req.params.eid, req.body);
    if (!e) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
    return success(res, e);
  } catch (e) { return next(e); }
}

export async function removeEvent(req, res, next) {
  try {
    const ok = await deleteEvent(req.params.id, req.params.eid);
    if (!ok) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
    return noContent(res);
  } catch (e) { return next(e); }
}

// ─── Venues ─────────────────────────────────────────

export async function getVenues(_req, res, next) {
  try { return success(res, await listVenues()); }
  catch (e) { return next(e); }
}

export async function postVenue(req, res, next) {
  try { return created(res, await createVenue(req.body)); }
  catch (e) { return next(e); }
}

// ─── Courts ─────────────────────────────────────────

export async function getCourts(req, res, next) {
  try { 
    const id = await resolveId(req.params.id);
    return success(res, await listTournamentCourts(id)); 
  }
  catch (e) { return next(e); }
}

export async function postCourt(req, res, next) {
  try { 
    const id = await resolveId(req.params.id);
    return created(res, await createCourt(id, req.body)); 
  }
  catch (e) { return next(e); }
}

export async function patchCourtStatus(req, res, next) {
  try {
    const c = await updateCourtStatus(req.params.id, req.params.cid, req.body.status);
    if (!c) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Court not found' } });
    return success(res, c);
  } catch (e) { return next(e); }
}

export async function putCourt(req, res, next) {
  try {
    const c = await updateCourt(req.params.id, req.params.cid, req.body);
    if (!c) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Court not found' } });
    return success(res, c);
  } catch (e) { return next(e); }
}

export async function removeCourt(req, res, next) {
  try {
    const ok = await deleteCourt(req.params.id, req.params.cid);
    if (!ok) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Court not found' } });
    return noContent(res);
  } catch (e) { return next(e); }
}

// ─── Dashboard ──────────────────────────────────────

export async function getDashboard(req, res, next) {
  try { return success(res, await getTournamentDashboard(req.params.id)); }
  catch (e) { return next(e); }
}
