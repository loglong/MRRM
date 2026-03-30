import { z } from 'zod';

export const UpdateDemandDto = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  source: z.enum(['PHONE', 'WECHAT', 'WEB', 'WALK_IN', 'REFERRAL', 'CAMPAIGN', 'OTHER']).optional(),
  estimatedAmount: z.number().positive().optional().nullable(),
  actualAmount: z.number().positive().optional().nullable(),
  closeReason: z.string().optional().nullable(),
});

export type UpdateDemandDtoType = z.infer<typeof UpdateDemandDto>;
