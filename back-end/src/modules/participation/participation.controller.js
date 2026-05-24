import { listEventParticipants, registerEventParticipant } from './participation.service.js';

export function getHealth(req, res) {
  res.json({ module: 'participation', status: 'ok' });
}

export async function getParticipants(req, res, next) {
  try {
    res.json({ data: await listEventParticipants(req.params.eventId) });
  } catch (error) {
    next(error);
  }
}

export async function postRegistration(req, res, next) {
  try {
    const { playerId, partnerId, seed } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: { message: 'playerId is required', status: 400 } });
    }

    const participant = await registerEventParticipant({
      eventId: req.params.eventId,
      playerId,
      partnerId,
      seed
    });

    return res.status(201).json({ data: participant });
  } catch (error) {
    return next(error);
  }
}
