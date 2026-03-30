import { z } from 'zod';

export const CreatePathDto = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
});

export type CreatePathDtoType = z.infer<typeof CreatePathDto>;
