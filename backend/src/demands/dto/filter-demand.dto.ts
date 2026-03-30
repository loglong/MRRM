import { z } from 'zod';

export const FilterDemandDto = z.object({
  patientId: z.string().uuid().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING', 'FULFILLED', 'CANCELLED', 'LOST']).optional(),
  type: z.enum(['CONSULTATION', 'TREATMENT', 'FOLLOWUP', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  source: z.enum(['PHONE', 'WECHAT', 'WEB', 'WALK_IN', 'REFERRAL', 'CAMPAIGN', 'OTHER']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type FilterDemandDtoType = z.infer<typeof FilterDemandDto>;
