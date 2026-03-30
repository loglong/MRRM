import { z } from 'zod';

export const CreateDemandDto = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  type: z.enum(['CONSULTATION', 'TREATMENT', 'FOLLOWUP', 'OTHER']),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  source: z.enum(['PHONE', 'WECHAT', 'WEB', 'WALK_IN', 'REFERRAL', 'CAMPAIGN', 'OTHER']).optional(),
  estimatedAmount: z.number().positive().optional().nullable(),
});

export type CreateDemandDtoType = z.infer<typeof CreateDemandDto>;
