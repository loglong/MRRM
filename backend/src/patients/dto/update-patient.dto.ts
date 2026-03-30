import { z } from 'zod';

export const UpdatePatientDto = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).optional().nullable(),
  birthDate: z.string().datetime().optional().nullable(),
  allergyHistory: z.string().optional().nullable(),
  pastHistory: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  tier: z.enum(['HIGH_VALUE', 'REGULAR', 'LOST_RISK']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CHURNED', 'DECEASED']).optional(),
  assignedUserId: z.string().uuid().optional().nullable(),
  lastVisitAt: z.string().datetime().optional().nullable(),
  nextVisitAt: z.string().datetime().optional().nullable(),
});

export type UpdatePatientDtoType = z.infer<typeof UpdatePatientDto>;
