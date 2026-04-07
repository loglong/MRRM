import { z } from 'zod';
export declare const TouchpointFiltersSchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    channel: z.ZodOptional<z.ZodString>;
    sentiment: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    patientId?: string | undefined;
    type?: string | undefined;
    channel?: string | undefined;
    sentiment?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    page?: number | undefined;
    patientId?: string | undefined;
    type?: string | undefined;
    limit?: number | undefined;
    channel?: string | undefined;
    sentiment?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export type TouchpointFiltersDto = z.infer<typeof TouchpointFiltersSchema>;
