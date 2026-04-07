import { z } from 'zod';

export const CreatePathDto = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  specialty: z.enum(['ORAL', 'OPHTHALMIC', 'ORTHOPEDIC', 'DERMATOLOGY', 'TCM']).optional(),
  icd10Code: z.string().max(20).optional(),
  icd9Code: z.string().max(20).optional(),
  diagnosisName: z.string().max(200).optional(),
  surgeryName: z.string().max(200).optional(),
});

export type CreatePathDtoType = z.infer<typeof CreatePathDto>;
