import { z } from 'zod';

export const CreateOrganizationDtoSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(200),
  code: z.string().min(1, 'Organization code is required').max(50).regex(/^[A-Z0-9_-]+$/i, 'Code must be alphanumeric'),
  domain: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateOrganizationDto = z.infer<typeof CreateOrganizationDtoSchema>;
