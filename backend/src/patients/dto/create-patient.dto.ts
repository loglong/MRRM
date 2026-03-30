import { z } from 'zod';

export const CreatePatientDto = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).optional().nullable(),
  birthDate: z.string().datetime().optional().nullable(),
  allergyHistory: z.string().optional(),
  pastHistory: z.string().optional(),
  address: z.string().optional().nullable(),
  tier: z.enum(['HIGH_VALUE', 'REGULAR', 'LOST_RISK']).optional(),
});

export type CreatePatientDtoType = z.infer<typeof CreatePatientDto>;
