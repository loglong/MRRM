import { z } from 'zod';

export const HealthRecordCategoryEnum = z.enum([
  'ALLERGY',
  'PAST_HISTORY',
  'EXAM_RESULT',
  'DIAGNOSIS',
  'TREATMENT',
]);

export const CreateHealthRecordDto = z.object({
  category: HealthRecordCategoryEnum,
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  recordDate: z.string().datetime(),
  data: z.record(z.any()).optional(),
  source: z.string().default('manual'),
});

export type CreateHealthRecordDtoType = z.infer<typeof CreateHealthRecordDto>;

export const UpdateHealthRecordDto = z.object({
  category: HealthRecordCategoryEnum.optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  recordDate: z.string().datetime().optional(),
  data: z.record(z.any()).optional(),
  source: z.string().optional(),
});

export type UpdateHealthRecordDtoType = z.infer<typeof UpdateHealthRecordDto>;

export const HealthRecordResponseDto = z.object({
  id: z.string(),
  patientId: z.string(),
  orgId: z.string(),
  category: HealthRecordCategoryEnum,
  title: z.string(),
  description: z.string().nullable(),
  recordDate: z.string(),
  data: z.record(z.any()).nullable(),
  source: z.string(),
  createdAt: z.string(),
});

export type HealthRecordResponseType = z.infer<typeof HealthRecordResponseDto>;
