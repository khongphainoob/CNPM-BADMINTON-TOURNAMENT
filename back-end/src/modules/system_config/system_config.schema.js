import { z } from 'zod';

export const updateConfigSchema = z.record(z.string());
