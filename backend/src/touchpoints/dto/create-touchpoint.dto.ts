import { z } from 'zod';

export const CreateTouchpointSchema = z.object({
  patientId: z.string().uuid(),
  type: z.enum(['VISIT', 'CALL', 'MESSAGE', 'EMAIL', 'WECHAT', 'VIDEO', 'SMS', 'OTHER']),
  channel: z.enum(['OFFLINE', 'ONLINE', 'MOBILE', 'PHONE']).optional(),
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
  duration: z.number().int().positive().optional(), // Duration in seconds
  outcome: z.string().optional(),
  followupRequired: z.boolean().optional(),
  followupDate: z.string().datetime().optional(),
});

export type CreateTouchpointDto = z.infer<typeof CreateTouchpointSchema>;
