import { z } from 'zod';

export const CreateTouchpointSchema = z.object({
  patientId: z.string().uuid(),
  demandId: z.string().uuid().nullish(), // PRD: 关联需求
  type: z.enum(['VISIT', 'CALL', 'MESSAGE', 'EMAIL', 'WECHAT', 'VIDEO', 'SMS', 'OTHER']),
  channel: z.enum(['OFFLINE', 'ONLINE', 'MOBILE', 'PHONE']).nullish(),
  title: z.string().min(1).max(200),
  content: z.string().nullish(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).nullish(),
  feedback: z.enum(['SATISFIED', 'NEUTRAL', 'DISSATISFIED']).nullish(), // PRD: 满意/一般/不满
  satisfactionScore: z.number().int().min(1).max(10).nullish(), // PRD: 满意度分值 1-10
  duration: z.number().int().positive().nullish(), // Duration in seconds
  outcome: z.string().nullish(),
  nextPlan: z.string().nullish(), // PRD: 下次跟进计划
  nextPlanTime: z.string().datetime().nullish(), // PRD: 计划跟进时间
  followupRequired: z.boolean().nullish(),
  followupDate: z.string().datetime().nullish(),
});

export type CreateTouchpointDto = z.infer<typeof CreateTouchpointSchema>;
