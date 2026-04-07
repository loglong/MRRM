import { z } from 'zod';
export declare const AssignPathDto: z.ZodObject<{
    patientId: z.ZodString;
    demandId: z.ZodString;
    startDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    demandId: string;
    startDate?: string | undefined;
}, {
    patientId: string;
    demandId: string;
    startDate?: string | undefined;
}>;
export type AssignPathDtoType = z.infer<typeof AssignPathDto>;
