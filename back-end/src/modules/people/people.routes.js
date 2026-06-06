import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../utils/validation.js';
import {
  createPlayerSchema, updatePlayerSchema, createClubSchema, updateClubSchema,
  createRefereeSchema, updateRefereeSchema, createCoachSchema, linkPlayerUserSchema
} from './people.schema.js';
import {
  getHealth,
  getClubs, postClub, putClub,
  getPlayers, getPlayer, postPlayer, putPlayer, removePlayer,
  patchApprovePlayer, postLinkPlayerUser,
  getReferees, getReferee, postReferee, putReferee,
  getCoaches, postCoach
} from './people.controller.js';

const router = Router();

router.get('/health', getHealth);

// Clubs
router.get('/clubs', getClubs);
router.post('/clubs', requireAuth, requireRole('admin', 'btc', 'coach'), validateBody(createClubSchema), postClub);
router.put('/clubs/:id', requireAuth, requireRole('admin', 'btc', 'coach'), validateBody(updateClubSchema), putClub);

// Players
router.get('/players', getPlayers);
router.get('/players/:id', getPlayer);
router.post('/players', requireAuth, requireRole('admin', 'btc', 'athlete', 'coach'), validateBody(createPlayerSchema), postPlayer);
router.put('/players/:id', requireAuth, requireRole('admin', 'btc', 'athlete', 'coach'), validateBody(updatePlayerSchema), putPlayer);
router.delete('/players/:id', requireAuth, requireRole('admin'), removePlayer);
router.patch('/players/:id/approve', requireAuth, requireRole('admin', 'btc'), patchApprovePlayer);
router.post('/players/:id/link-user', requireAuth, requireRole('admin'), validateBody(linkPlayerUserSchema), postLinkPlayerUser);

// Referees
router.get('/referees', getReferees);
router.get('/referees/:id', getReferee);
router.post('/referees', requireAuth, requireRole('admin', 'btc'), validateBody(createRefereeSchema), postReferee);
router.put('/referees/:id', requireAuth, requireRole('admin', 'btc'), validateBody(updateRefereeSchema), putReferee);

// Coaches
router.get('/coaches', getCoaches);
router.post('/coaches', requireAuth, requireRole('admin', 'btc'), validateBody(createCoachSchema), postCoach);

export default router;
