import { z } from 'zod';

export const createPlayerSchema = z.object({
  code: z.string().optional(),
  clubId: z.number().int().positive(),
  name: z.string().min(1, 'Tên không được để trống'),
  gender: z.enum(['M', 'F']),
  dob: z.string().optional(),
  rating: z.number().int().min(0).default(0),
  tier: z.enum(['A', 'B', 'C']).optional(),
  note: z.string().optional(),
  cccd: z.string().optional(),
  photoUrl: z.string().optional(),
  userId: z.number().int().positive().optional()
});

export const updatePlayerSchema = createPlayerSchema.partial();

export const createClubSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1),
  province: z.string().optional()
});

export const updateClubSchema = createClubSchema.partial();

export const createRefereeSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1),
  cert: z.enum(['QG_A', 'QG_B']),
  phone: z.string().optional(),
  userId: z.number().int().positive().optional()
});

export const updateRefereeSchema = createRefereeSchema.partial();

export const createCoachSchema = z.object({
  name: z.string().min(1),
  clubId: z.number().int().positive().optional(),
  phone: z.string().optional(),
  userId: z.number().int().positive().optional()
});

export const linkPlayerUserSchema = z.object({
  userId: z.number().int().positive()
});
