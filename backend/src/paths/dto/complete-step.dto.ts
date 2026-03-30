import { z } from 'zod';

export const CompleteStepDto = z.object({
  notes: z.string().optional(),
});

export type CompleteStepDtoType = z.infer<typeof CompleteStepDto>;

export const SkipStepDto = z.object({
  reason: z.string().optional(),
});

export type SkipStepDtoType = z.infer<typeof SkipStepDto>;
