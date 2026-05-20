import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { getHealth, getMatch, getMatches, postMatch } from './competition.controller.js';

const router = Router();

router.get('/health', getHealth);
router.get('/matches', getMatches);
router.get('/matches/:id', getMatch);
router.post('/matches', requireAuth, requireRole('admin', 'btc'), postMatch);

export default router;
