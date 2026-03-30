import { z } from 'zod';

export const UpdatePathDto = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
});

export type UpdatePathDtoType = z.infer<typeof UpdatePathDto>;
