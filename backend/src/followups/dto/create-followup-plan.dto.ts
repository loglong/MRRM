import { z } from 'zod';

export const CreateFollowupPlanSchema = z.object({
  patientId: z.string().uuid(),
  name: z.string().min(1).max(200),
  type: z.enum(['ROUTINE', 'POST_TREATMENT', 'PRE_APPOINTMENT', 'CUSTOM']).optional().default('ROUTINE'),
  frequencyDays: z.number().int().positive().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  assignedUserId: z.string().uuid().optional(),
  pathInstanceStepId: z.string().uuid().optional(),
});

export type CreateFollowupPlanDto = z.infer<typeof CreateFollowupPlanSchema>;
