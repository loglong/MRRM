import { z } from 'zod';
export declare const ChangeStatusDemandDto: z.ZodObject<{
    status: z.ZodEnum<["OPEN", "IN_PROGRESS", "PENDING", "FULFILLED", "CANCELLED", "LOST"]>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "OPEN" | "IN_PROGRESS" | "PENDING" | "FULFILLED" | "CANCELLED" | "LOST";
    notes?: string | null | undefined;
}, {
    status: "OPEN" | "IN_PROGRESS" | "PENDING" | "FULFILLED" | "CANCELLED" | "LOST";
    notes?: string | null | undefined;
}>;
export type ChangeStatusDemandDtoType = z.infer<typeof ChangeStatusDemandDto>;
