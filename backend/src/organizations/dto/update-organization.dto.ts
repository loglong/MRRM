import { z } from 'zod';

export const UpdateOrganizationDtoSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  domain: z.string().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
  metadata: z.record(z.any()).optional(),
});

export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationDtoSchema>;
