import { z } from 'zod';
export declare const FilterDemandDto: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["OPEN", "IN_PROGRESS", "PENDING", "FULFILLED", "CANCELLED", "LOST"]>>;
    type: z.ZodOptional<z.ZodEnum<["CONSULTATION", "TREATMENT", "FOLLOWUP", "OTHER"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    source: z.ZodOptional<z.ZodEnum<["PHONE", "WECHAT", "WEB", "WALK_IN", "REFERRAL", "CAMPAIGN", "OTHER"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "OPEN" | "IN_PROGRESS" | "PENDING" | "FULFILLED" | "CANCELLED" | "LOST" | undefined;
    patientId?: string | undefined;
    type?: "OTHER" | "CONSULTATION" | "TREATMENT" | "FOLLOWUP" | undefined;
    source?: "OTHER" | "PHONE" | "WECHAT" | "WEB" | "WALK_IN" | "REFERRAL" | "CAMPAIGN" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    page?: number | undefined;
    status?: "OPEN" | "IN_PROGRESS" | "PENDING" | "FULFILLED" | "CANCELLED" | "LOST" | undefined;
    patientId?: string | undefined;
    type?: "OTHER" | "CONSULTATION" | "TREATMENT" | "FOLLOWUP" | undefined;
    source?: "OTHER" | "PHONE" | "WECHAT" | "WEB" | "WALK_IN" | "REFERRAL" | "CAMPAIGN" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    limit?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export type FilterDemandDtoType = z.infer<typeof FilterDemandDto>;
