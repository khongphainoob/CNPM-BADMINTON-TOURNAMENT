import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../utils/validation.js';
import {
  createTournamentSchema, updateTournamentSchema, changeTournamentStatusSchema,
  createEventSchema, updateEventSchema,
  createVenueSchema, createCourtSchema, updateCourtStatusSchema
} from './tournament.schema.js';
import {
  getHealth,
  getTournaments, getTournament, postTournament, putTournament, removeTournament, patchStatus,
  getEvents, postEvent, putEvent, removeEvent,
  getVenues, postVenue,
  getCourts, postCourt, patchCourtStatus, putCourt, removeCourt,
  getDashboard
} from './tournament.controller.js';

const router = Router();

router.get('/health', getHealth);

// Venues (top-level, before /:id routes)
router.get('/venues', getVenues);
router.post('/venues', requireAuth, requireRole('admin', 'btc'), validateBody(createVenueSchema), postVenue);

// Tournaments CRUD
router.get('/', getTournaments);
router.get('/:id', getTournament);
router.post('/', requireAuth, requireRole('admin', 'btc'), validateBody(createTournamentSchema), postTournament);
router.put('/:id', requireAuth, requireRole('admin', 'btc'), validateBody(updateTournamentSchema), putTournament);
router.delete('/:id', requireAuth, requireRole('admin'), removeTournament);
router.patch('/:id/status', requireAuth, requireRole('admin', 'btc'), validateBody(changeTournamentStatusSchema), patchStatus);

// Events
router.get('/:id/events', getEvents);
router.post('/:id/events', requireAuth, requireRole('admin', 'btc'), validateBody(createEventSchema), postEvent);
router.put('/:id/events/:eid', requireAuth, requireRole('admin', 'btc'), validateBody(updateEventSchema), putEvent);
router.delete('/:id/events/:eid', requireAuth, requireRole('admin', 'btc'), removeEvent);

// Courts
router.get('/:id/courts', getCourts);
router.post('/:id/courts', requireAuth, requireRole('admin', 'btc'), validateBody(createCourtSchema), postCourt);
router.put('/:id/courts/:cid', requireAuth, requireRole('admin', 'btc'), putCourt);
router.patch('/:id/courts/:cid/status', requireAuth, requireRole('admin', 'btc'), validateBody(updateCourtStatusSchema), patchCourtStatus);
router.delete('/:id/courts/:cid', requireAuth, requireRole('admin', 'btc'), removeCourt);

// Dashboard
router.get('/:id/dashboard', requireAuth, requireRole('admin', 'btc'), getDashboard);

export default router;
