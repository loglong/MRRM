import { z } from 'zod';

export const JourneyFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type JourneyFiltersDto = z.infer<typeof JourneyFiltersSchema>;
