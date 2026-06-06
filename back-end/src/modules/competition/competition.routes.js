import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../utils/validation.js';
import {
  createMatchSchema, updateMatchSchema, scheduleMatchSchema,
  addMatchParticipantSchema, addSetScoreSchema, scoreEventSchema
} from './competition.schema.js';
import {
  getHealth, getMatches, getMatch, postMatch, putMatch,
  patchSchedule, patchStart, patchComplete, postParticipant,
  postSetScore, postScoreEvent, getScoreEvents, postUndoScore,
  postGenerateDraw
} from './competition.controller.js';

const router = Router();

// Draw Generation
router.post('/events/:id/draw', requireAuth, requireRole('admin', 'btc'), postGenerateDraw);

router.get('/health', getHealth);

// Matches CRUD
router.get('/matches', getMatches);
router.get('/matches/:id', getMatch);
router.post('/matches', requireAuth, requireRole('admin', 'btc'), validateBody(createMatchSchema), postMatch);
router.put('/matches/:id', requireAuth, requireRole('admin', 'btc'), validateBody(updateMatchSchema), putMatch);

// Scheduling & State Transitions
router.patch('/matches/:id/schedule', requireAuth, requireRole('admin', 'btc'), validateBody(scheduleMatchSchema), patchSchedule);
router.patch('/matches/:id/start', requireAuth, requireRole('admin', 'btc', 'referee'), patchStart);
router.patch('/matches/:id/complete', requireAuth, requireRole('admin', 'btc', 'referee'), patchComplete);

// Participants
router.post('/matches/:id/participants', requireAuth, requireRole('admin', 'btc'), validateBody(addMatchParticipantSchema), postParticipant);

// Scoring & Audit Trail
router.post('/matches/:id/sets', requireAuth, requireRole('admin', 'btc', 'referee'), validateBody(addSetScoreSchema), postSetScore);
router.get('/matches/:id/score-events', getScoreEvents);
router.post('/matches/:id/score-events', requireAuth, requireRole('admin', 'btc', 'referee'), validateBody(scoreEventSchema), postScoreEvent);
router.post('/matches/:id/undo', requireAuth, requireRole('admin', 'btc', 'referee'), postUndoScore);

export default router;
