import { z } from 'zod';

export const createMatchSchema = z.object({
  eventId: z.number().int().positive(),
  round: z.string().optional(),
  courtId: z.number().int().positive().optional(),
  refereeId: z.number().int().positive().optional(),
  scheduledAt: z.string().optional(),
  code: z.string().optional()
});

export const updateMatchSchema = z.object({
  courtId: z.number().int().positive().optional(),
  refereeId: z.number().int().positive().optional(),
  scheduledAt: z.string().optional(),
  status: z.enum(['upcoming', 'live', 'completed', 'cancelled', 'walkover']).optional()
});

export const scheduleMatchSchema = z.object({
  courtId: z.number().int().positive(),
  scheduledAt: z.string(),
  refereeId: z.number().int().positive().optional(),
  estimatedDurationMins: z.number().int().positive().optional()
});

export const addMatchParticipantSchema = z.object({
  side: z.enum(['A', 'B']),
  playerId: z.number().int().positive(),
  seed: z.number().int().positive().optional()
});

export const addSetScoreSchema = z.object({
  setNo: z.number().int().min(1).max(5),
  scoreA: z.number().int().min(0),
  scoreB: z.number().int().min(0)
});

export const matchResultSchema = z.object({
  resultType: z.enum(['walkover', 'disqualification']),
  winnerSide: z.enum(['A', 'B']),
  note: z.string().optional()
});

export const scoreEventSchema = z.object({
  setNo: z.number().int().min(1),
  scorer: z.enum(['A', 'B']),
  prevScoreA: z.number().int().min(0).default(0),
  prevScoreB: z.number().int().min(0).default(0),
  prevServing: z.enum(['A', 'B']).default('A'),
  causedSetEnd: z.boolean().default(false)
});
