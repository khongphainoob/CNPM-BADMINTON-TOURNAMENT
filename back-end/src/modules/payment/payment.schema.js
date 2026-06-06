import { z } from 'zod';

export const createPaymentSchema = z.object({
  userId: z.number().int().positive().optional(),
  eventParticipantId: z.number().int().positive().optional(),
  amount: z.number().int().positive(),
  purpose: z.string().min(1),
  code: z.string().optional()
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'failed', 'refunded'])
});

export const recordTransactionSchema = z.object({
  gateway: z.string().min(1),
  gatewayTxnId: z.string().min(1),
  amount: z.number().int().positive(),
  status: z.enum(['success', 'failed', 'pending'])
});
