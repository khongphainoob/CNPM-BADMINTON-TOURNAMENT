import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../utils/validation.js';
import {
  createPaymentSchema, updatePaymentStatusSchema, recordTransactionSchema
} from './payment.schema.js';
import {
  getHealth, getPayments, getMyPayments, getPayment,
  postPayment, patchStatus, postTransaction, getStats
} from './payment.controller.js';

const router = Router();

router.get('/health', getHealth);

// Personal
router.get('/mine', requireAuth, getMyPayments);

// Admin / BTC
router.get('/', requireAuth, requireRole('admin', 'btc'), getPayments);
router.get('/stats', requireAuth, requireRole('admin', 'btc'), getStats);
router.get('/revenue-stats', requireAuth, requireRole('admin', 'btc'), getStats);
router.post('/', requireAuth, requireRole('admin', 'btc'), validateBody(createPaymentSchema), postPayment);

import { postExpense } from './payment.controller.js';
router.post('/expenses', requireAuth, requireRole('admin', 'btc'), postExpense);

// Individual
router.get('/:id', requireAuth, getPayment);
router.patch('/:id/status', requireAuth, requireRole('admin', 'btc'), validateBody(updatePaymentStatusSchema), patchStatus);
router.post('/:id/transactions', requireAuth, requireRole('admin', 'btc'), validateBody(recordTransactionSchema), postTransaction);

export default router;
