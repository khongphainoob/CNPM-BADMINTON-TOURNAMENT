import { z } from 'zod';

export const createNotificationSchema = z.object({
  userId: z.number().int().positive(),
  templateId: z.number().int().positive().optional(),
  channel: z.enum(['in_app', 'email', 'sms']).default('in_app'),
  subject: z.string().min(1),
  body: z.string().min(1),
  meta: z.any().optional()
});
