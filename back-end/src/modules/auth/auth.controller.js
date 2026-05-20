import { getCurrentUser, loginUser, registerUser } from './auth.service.js';

export function getHealth(req, res) {
  res.json({ module: 'auth', status: 'ok' });
}

export async function register(req, res, next) {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: { message: 'email, password and name are required', status: 400 } });
    }

    const user = await registerUser({ email, password, name, phone, role });
    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: { message: 'email and password are required', status: 400 } });
    }

    const result = await loginUser({ email, password });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found', status: 404 } });
    }

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}
