import { z } from 'zod';

export const FollowupPlanFiltersSchema = z.object({
  patientId: z.string().uuid().optional(),
  status: z.string().optional(),
  assignedUserId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const FollowupRecordFiltersSchema = z.object({
  planId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  status: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type FollowupPlanFiltersDto = z.infer<typeof FollowupPlanFiltersSchema>;
export type FollowupRecordFiltersDto = z.infer<typeof FollowupRecordFiltersSchema>;
