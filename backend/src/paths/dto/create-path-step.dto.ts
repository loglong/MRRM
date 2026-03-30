import { z } from 'zod';

export const CreatePathStepDto = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional().nullable(),
  stepOrder: z.number().int().positive(),
  stepType: z.enum(['START', 'TASK', 'AUTOMATED_ACTION', 'WAIT', 'DECISION', 'END']).optional(),
  estimatedDays: z.number().int().positive().optional().nullable(),
  timeoutHours: z.number().int().positive().optional().nullable(),
  triggerAction: z.string().optional().nullable(),
  notificationTemplate: z.string().optional().nullable(),
});

export type CreatePathStepDtoType = z.infer<typeof CreatePathStepDto>;
