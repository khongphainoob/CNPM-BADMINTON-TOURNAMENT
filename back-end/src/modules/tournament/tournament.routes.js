import { Router } from 'express';
import { getCourts, getEvents, getHealth, getTournament, getTournaments } from './tournament.controller.js';

const router = Router();

router.get('/health', getHealth);
router.get('/', getTournaments);
router.get('/:id', getTournament);
router.get('/:id/events', getEvents);
router.get('/:id/courts', getCourts);

export default router;
