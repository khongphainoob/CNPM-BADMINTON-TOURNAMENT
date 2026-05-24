import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { getClubs, getHealth, getPlayers, getReferees, postPlayer } from './people.controller.js';

const router = Router();

router.get('/health', getHealth);
router.get('/clubs', getClubs);
router.get('/players', getPlayers);
router.get('/referees', getReferees);
router.post('/players', requireAuth, requireRole('admin', 'btc'), postPlayer);

export default router;
