import { z } from 'zod';
export declare const FollowupPlanFiltersSchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    assignedUserId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: string | undefined;
    assignedUserId?: string | undefined;
    patientId?: string | undefined;
}, {
    page?: number | undefined;
    status?: string | undefined;
    assignedUserId?: string | undefined;
    patientId?: string | undefined;
    limit?: number | undefined;
}>;
export declare const FollowupRecordFiltersSchema: z.ZodObject<{
    planId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: string | undefined;
    patientId?: string | undefined;
    planId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    page?: number | undefined;
    status?: string | undefined;
    patientId?: string | undefined;
    limit?: number | undefined;
    planId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export type FollowupPlanFiltersDto = z.infer<typeof FollowupPlanFiltersSchema>;
export type FollowupRecordFiltersDto = z.infer<typeof FollowupRecordFiltersSchema>;
