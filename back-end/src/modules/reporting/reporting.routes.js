import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../utils/validation.js';
import {
  createNewsSchema, updateNewsSchema,
  createInventorySchema, updateInventorySchema, issueInventorySchema
} from './reporting.schema.js';
import {
  getHealth, getNews, postNews, putNews,
  getInventory, postInventory, putInventory, postIssueInventory,
  getActivityLog, getTemplates
} from './reporting.controller.js';

const router = Router();

router.get('/health', getHealth);

// News (Public Read)
router.get('/news', getNews);
router.post('/news', requireAuth, requireRole('admin', 'btc'), validateBody(createNewsSchema), postNews);
router.put('/news/:id', requireAuth, requireRole('admin', 'btc'), validateBody(updateNewsSchema), putNews);

// Leaderboard
import { getLeaderboard } from './reporting.controller.js';
router.get('/leaderboard', getLeaderboard);

// Inventory
router.get('/inventory', requireAuth, requireRole('admin', 'btc'), getInventory);
router.post('/inventory', requireAuth, requireRole('admin', 'btc'), validateBody(createInventorySchema), postInventory);
router.put('/inventory/:sku', requireAuth, requireRole('admin', 'btc'), validateBody(updateInventorySchema), putInventory);
router.post('/inventory/:sku/issue', requireAuth, requireRole('admin', 'btc', 'referee'), validateBody(issueInventorySchema), postIssueInventory);

// Activity Log
router.get('/activity-log', requireAuth, requireRole('admin', 'btc'), getActivityLog);

// Report Templates
router.get('/templates', requireAuth, requireRole('admin', 'btc'), getTemplates);

export default router;
