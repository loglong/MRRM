import { z } from 'zod';

export const ChangeStatusDemandDto = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING', 'FULFILLED', 'CANCELLED', 'LOST']),
  notes: z.string().max(500).optional().nullable(),
});

export type ChangeStatusDemandDtoType = z.infer<typeof ChangeStatusDemandDto>;
