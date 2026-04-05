import { z } from 'zod';

export const UpdatePathDto = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  icd10Code: z.string().max(20).optional().nullable(),
  icd9Code: z.string().max(20).optional().nullable(),
  diagnosisName: z.string().max(200).optional().nullable(),
});

export type UpdatePathDtoType = z.infer<typeof UpdatePathDto>;
