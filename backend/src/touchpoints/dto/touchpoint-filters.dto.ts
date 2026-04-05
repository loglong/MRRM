import { z } from 'zod';

export const TouchpointFiltersSchema = z.object({
  patientId: z.string().uuid().optional(),
  type: z.string().optional(),
  channel: z.string().optional(),
  sentiment: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type TouchpointFiltersDto = z.infer<typeof TouchpointFiltersSchema>;
