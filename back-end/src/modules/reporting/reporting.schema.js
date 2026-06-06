import { z } from 'zod';

export const createNewsSchema = z.object({
  tournamentId: z.number().int().positive().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  tag: z.string().optional(),
  slug: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional()
});

export const updateNewsSchema = createNewsSchema.partial();

export const createInventorySchema = z.object({
  sku: z.string().min(2),
  name: z.string().min(2),
  minStock: z.number().int().min(0).optional(),
  initialStock: z.number().int().min(0).optional(),
});

export const updateInventorySchema = z.object({
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  issued: z.number().int().min(0).optional()
});

export const issueInventorySchema = z.object({
  qty: z.number().int().positive(),
  matchId: z.number().int().positive().optional()
});
