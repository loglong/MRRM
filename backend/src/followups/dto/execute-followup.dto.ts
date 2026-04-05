import { z } from 'zod';

export const ExecuteFollowupSchema = z.object({
  outcome: z.string().optional(),
  notes: z.string().optional(),
});

export type ExecuteFollowupDto = z.infer<typeof ExecuteFollowupSchema>;
