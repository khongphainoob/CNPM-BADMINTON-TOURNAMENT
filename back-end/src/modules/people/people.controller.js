import { createPlayer, listClubs, listPlayers, listReferees } from './people.service.js';

export function getHealth(req, res) {
  res.json({ module: 'people', status: 'ok' });
}

export async function getClubs(req, res, next) {
  try {
    res.json({ data: await listClubs() });
  } catch (error) {
    next(error);
  }
}

export async function getPlayers(req, res, next) {
  try {
    res.json({ data: await listPlayers() });
  } catch (error) {
    next(error);
  }
}

export async function getReferees(req, res, next) {
  try {
    res.json({ data: await listReferees() });
  } catch (error) {
    next(error);
  }
}

export async function postPlayer(req, res, next) {
  try {
    const { code, clubId, name, gender, dob, rating, tier, note } = req.body;

    if (!clubId || !name || !gender) {
      return res.status(400).json({ error: { message: 'clubId, name and gender are required', status: 400 } });
    }

    const player = await createPlayer({ code, clubId, name, gender, dob, rating, tier, note });
    return res.status(201).json({ data: player });
  } catch (error) {
    return next(error);
  }
}
