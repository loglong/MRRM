import { z } from 'zod';

export const AssignPathDto = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  demandId: z.string().uuid('Invalid demand ID'),
  startDate: z.string().datetime().optional(),
});

export type AssignPathDtoType = z.infer<typeof AssignPathDto>;
