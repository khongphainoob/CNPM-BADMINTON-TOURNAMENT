import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../utils/validation.js';
import {
  registerSchema, loginSchema, changePasswordSchema,
  approveUserSchema, changeRoleSchema
} from './auth.schema.js';
import {
  getHealth, register, login, me, changePass,
  getUsers, approve, reject, changeRole
} from './auth.controller.js';

const router = Router();

router.get('/health', getHealth);
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', requireAuth, me);
router.post('/change-password', requireAuth, validateBody(changePasswordSchema), changePass);

// Admin user management
router.get('/users', requireAuth, requireRole('admin'), getUsers);
router.patch('/users/:id/approve', requireAuth, requireRole('admin'), validateBody(approveUserSchema), approve);
router.patch('/users/:id/reject', requireAuth, requireRole('admin'), reject);
router.patch('/users/:id/role', requireAuth, requireRole('admin'), validateBody(changeRoleSchema), changeRole);

export default router;
