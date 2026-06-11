import { z } from 'zod';

export const createTournamentSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  nameEn: z.string().optional(),
  venueId: z.number().int().positive().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  format: z.string().optional(),
  budget: z.number().int().min(0).default(0)
});

export const updateTournamentSchema = createTournamentSchema.partial();

export const changeTournamentStatusSchema = z.object({
  status: z.enum(['draft', 'live', 'finished', 'cancelled'])
});

export const createEventSchema = z.object({
  categoryCode: z.enum(['MS', 'WS', 'MD', 'WD', 'XD']),
  label: z.string().optional(),
  maxSets: z.number().int().min(1).max(5).default(3),
  pointsPerSet: z.number().int().min(11).max(30).default(21),
  contentType: z.enum(['singles', 'doubles', 'mixed', 'mixed_doubles']).optional(),
  gender: z.enum(['male', 'female', 'mixed', 'open']).optional(),
  ageGroup: z.string().optional(),
  maxParticipants: z.number().int().min(2).max(512).optional(),
  registrationStart: z.string().optional(),
  registrationEnd: z.string().optional()
});

export const updateEventSchema = createEventSchema.partial();

export const createVenueSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  province: z.string().optional()
});

export const createCourtSchema = z.object({
  label: z.string().min(1),
  floor: z.string().optional(),
  status: z.enum(['live', 'idle', 'maintenance']).default('idle')
});

export const updateCourtStatusSchema = z.object({
  status: z.enum(['live', 'idle', 'maintenance'])
});
