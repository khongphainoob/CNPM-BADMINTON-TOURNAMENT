import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { getHealth, getParticipants, postRegistration } from './participation.controller.js';

const router = Router();

router.get('/health', getHealth);
router.get('/events/:eventId/participants', getParticipants);
router.post('/events/:eventId/register', requireAuth, requireRole('admin', 'btc', 'athlete'), postRegistration);

export default router;
