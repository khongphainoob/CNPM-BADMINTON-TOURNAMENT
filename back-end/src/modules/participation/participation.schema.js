import { z } from 'zod';

export const registerParticipantSchema = z.object({
  playerId: z.number().int().positive().optional(),
  partnerId: z.number().int().positive().optional(),
  seed: z.number().int().positive().optional()
});

export const updateParticipantStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'supplement_required', 'registered', 'checked_in', 'withdrawn'])
});

export const assignSeedSchema = z.object({
  seed: z.number().int().positive()
});
