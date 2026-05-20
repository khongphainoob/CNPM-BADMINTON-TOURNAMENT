import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { getHealth, login, me, register } from './auth.controller.js';

const router = Router();

router.get('/health', getHealth);
router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);

export default router;
