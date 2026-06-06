import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../utils/validation.js';
import { createNotificationSchema } from './notification.schema.js';
import {
  getHealth, getMyNotifications, getMyUnreadCount, patchRead,
  postNotification, getTemplates
} from './notification.controller.js';

const router = Router();

router.get('/health', getHealth);

// Personal Inbox
router.get('/', requireAuth, getMyNotifications);
router.get('/unread-count', requireAuth, getMyUnreadCount);
router.patch('/:id/read', requireAuth, patchRead);

// Admin / BTC
router.post('/', requireAuth, requireRole('admin', 'btc'), validateBody(createNotificationSchema), postNotification);
router.get('/templates', requireAuth, requireRole('admin', 'btc'), getTemplates);

export default router;
