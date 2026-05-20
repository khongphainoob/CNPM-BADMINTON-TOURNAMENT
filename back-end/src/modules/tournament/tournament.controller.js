import { getTournamentById, listTournamentCourts, listTournamentEvents, listTournaments } from './tournament.service.js';

export function getHealth(req, res) {
  res.json({ module: 'tournament', status: 'ok' });
}

export async function getTournaments(req, res, next) {
  try {
    res.json({ data: await listTournaments() });
  } catch (error) {
    next(error);
  }
}

export async function getTournament(req, res, next) {
  try {
    const tournament = await getTournamentById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ error: { message: 'Tournament not found', status: 404 } });
    }

    return res.json({ data: tournament });
  } catch (error) {
    return next(error);
  }
}

export async function getEvents(req, res, next) {
  try {
    res.json({ data: await listTournamentEvents(req.params.id) });
  } catch (error) {
    next(error);
  }
}

export async function getCourts(req, res, next) {
  try {
    res.json({ data: await listTournamentCourts(req.params.id) });
  } catch (error) {
    next(error);
  }
}
