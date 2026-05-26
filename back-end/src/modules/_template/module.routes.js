import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../utils/validation.js';
import {
  createItem,
  createItemSchema,
  deleteItem,
  getHealth,
  getItem,
  listItems,
  updateItem,
  updateItemSchema
} from './module.controller.js';

const router = Router();

router.get('/health', getHealth);
router.get('/', listItems);
router.get('/:id', getItem);
router.post('/', requireAuth, requireRole('admin'), validateBody(createItemSchema), createItem);
router.put('/:id', requireAuth, requireRole('admin'), validateBody(updateItemSchema), updateItem);
router.delete('/:id', requireAuth, requireRole('admin'), deleteItem);

export default router;
