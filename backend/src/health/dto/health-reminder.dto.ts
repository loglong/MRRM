import { z } from 'zod';

export const ReminderTypeEnum = z.enum(['REVIEW', 'MEDICATION']);
export const ReminderStatusEnum = z.enum(['PENDING', 'COMPLETED', 'CANCELLED']);

export const CreateHealthReminderDto = z.object({
  patientId: z.string().uuid(),
  type: ReminderTypeEnum,
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().optional(),
  remindAt: z.string().datetime(),
});

export type CreateHealthReminderDtoType = z.infer<typeof CreateHealthReminderDto>;

export const HealthReminderResponseDto = z.object({
  id: z.string(),
  patientId: z.string(),
  orgId: z.string(),
  type: ReminderTypeEnum,
  title: z.string(),
  content: z.string().nullable(),
  remindAt: z.string(),
  status: ReminderStatusEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type HealthReminderResponseType = z.infer<typeof HealthReminderResponseDto>;
