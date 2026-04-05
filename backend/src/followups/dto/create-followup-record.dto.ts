import { z } from 'zod';

export const CreateFollowupRecordSchema = z.object({
  planId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  pathInstanceStepId: z.string().uuid().optional(),
});

export type CreateFollowupRecordDto = z.infer<typeof CreateFollowupRecordSchema>;
