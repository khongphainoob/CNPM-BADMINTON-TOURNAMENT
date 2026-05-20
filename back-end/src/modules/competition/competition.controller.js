import { createMatch, getMatchById, listMatches } from './competition.service.js';

export function getHealth(req, res) {
  res.json({ module: 'competition', status: 'ok' });
}

export async function getMatches(req, res, next) {
  try {
    res.json({ data: await listMatches() });
  } catch (error) {
    next(error);
  }
}

export async function getMatch(req, res, next) {
  try {
    const match = await getMatchById(req.params.id);

    if (!match) {
      return res.status(404).json({ error: { message: 'Match not found', status: 404 } });
    }

    return res.json({ data: match });
  } catch (error) {
    return next(error);
  }
}

export async function postMatch(req, res, next) {
  try {
    const { eventId, round, courtId, refereeId, scheduledAt, code } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: { message: 'eventId is required', status: 400 } });
    }

    const match = await createMatch({ eventId, round, courtId, refereeId, scheduledAt, code });
    return res.status(201).json({ data: match });
  } catch (error) {
    return next(error);
  }
}
