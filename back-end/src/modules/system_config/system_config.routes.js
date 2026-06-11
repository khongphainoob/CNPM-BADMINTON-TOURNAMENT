import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../utils/validation.js';
import { getConfigsHandler, updateConfigsHandler } from './system_config.controller.js';
import { updateConfigSchema } from './system_config.schema.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), getConfigsHandler);
router.patch('/', requireAuth, requireRole('admin'), validateBody(updateConfigSchema), updateConfigsHandler);

export default router;
