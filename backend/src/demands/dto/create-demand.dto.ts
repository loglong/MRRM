import { z } from 'zod';

export const CreateDemandDto = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  type: z.enum(['CONSULTATION', 'TREATMENT', 'FOLLOWUP', 'OTHER']),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  source: z.enum(['PHONE', 'WECHAT', 'WEB', 'WALK_IN', 'REFERRAL', 'CAMPAIGN', 'OTHER']).optional(),
  estimatedAmount: z.number().positive().optional().nullable(),
  // 开发期管理人(前台)
  developmentManager: z.string().optional().nullable(),
  // 治疗前期
  preTreatmentStartDate: z.string().datetime().optional().nullable(),
  preTreatmentManager: z.string().optional().nullable(),
  // 治疗期
  treatmentStartDate: z.string().datetime().optional().nullable(),
  treatmentManager: z.string().optional().nullable(),
  treatmentEndDate: z.string().datetime().optional().nullable(),
  // 技术路径
  pathId: z.string().uuid().optional().nullable(),
  maintenanceManager: z.string().optional().nullable(),
  maintenancePlanId: z.string().optional().nullable(),
  // 需求结束时间
  demandEndDate: z.string().datetime().optional().nullable(),
});

export type CreateDemandDtoType = z.infer<typeof CreateDemandDto>;
