import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../utils/validation.js';
import { registerParticipantSchema, updateParticipantStatusSchema, assignSeedSchema } from './participation.schema.js';
import {
  getHealth, getParticipants, getParticipant, postRegistration,
  patchStatus, patchSeed, postAutoSeed, deleteParticipant,
  postConfirmPartner, postRejectPartner
} from './participation.controller.js';

const router = Router();

router.get('/health', getHealth);

// Event participants
router.get('/events/:eventId/participants', getParticipants);
router.post('/events/:eventId/register', requireAuth, requireRole('admin', 'btc', 'athlete', 'coach'), validateBody(registerParticipantSchema), postRegistration);
router.post('/events/:eventId/auto-seed', requireAuth, requireRole('admin', 'btc'), postAutoSeed);

// Individual participant
router.get('/participants', getParticipants);
router.get('/participants/:id', getParticipant);
router.patch('/participants/:id/status', requireAuth, requireRole('admin', 'btc'), validateBody(updateParticipantStatusSchema), patchStatus);
router.patch('/participants/:id/seed', requireAuth, requireRole('admin', 'btc'), validateBody(assignSeedSchema), patchSeed);
router.post('/participants/:id/confirm-partner', requireAuth, postConfirmPartner);
router.post('/participants/:id/reject-partner', requireAuth, postRejectPartner);
router.delete('/participants/:id', requireAuth, requireRole('admin', 'btc', 'athlete', 'coach'), deleteParticipant);

export default router;
