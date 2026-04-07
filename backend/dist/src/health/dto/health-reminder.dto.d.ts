import { z } from 'zod';
export declare const ReminderTypeEnum: z.ZodEnum<["REVIEW", "MEDICATION"]>;
export declare const ReminderStatusEnum: z.ZodEnum<["PENDING", "COMPLETED", "CANCELLED"]>;
export declare const CreateHealthReminderDto: z.ZodObject<{
    patientId: z.ZodString;
    type: z.ZodEnum<["REVIEW", "MEDICATION"]>;
    title: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    remindAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    type: "REVIEW" | "MEDICATION";
    title: string;
    remindAt: string;
    content?: string | undefined;
}, {
    patientId: string;
    type: "REVIEW" | "MEDICATION";
    title: string;
    remindAt: string;
    content?: string | undefined;
}>;
export type CreateHealthReminderDtoType = z.infer<typeof CreateHealthReminderDto>;
export declare const HealthReminderResponseDto: z.ZodObject<{
    id: z.ZodString;
    patientId: z.ZodString;
    orgId: z.ZodString;
    type: z.ZodEnum<["REVIEW", "MEDICATION"]>;
    title: z.ZodString;
    content: z.ZodNullable<z.ZodString>;
    remindAt: z.ZodString;
    status: z.ZodEnum<["PENDING", "COMPLETED", "CANCELLED"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    orgId: string;
    status: "PENDING" | "CANCELLED" | "COMPLETED";
    createdAt: string;
    updatedAt: string;
    patientId: string;
    type: "REVIEW" | "MEDICATION";
    title: string;
    content: string | null;
    remindAt: string;
}, {
    id: string;
    orgId: string;
    status: "PENDING" | "CANCELLED" | "COMPLETED";
    createdAt: string;
    updatedAt: string;
    patientId: string;
    type: "REVIEW" | "MEDICATION";
    title: string;
    content: string | null;
    remindAt: string;
}>;
export type HealthReminderResponseType = z.infer<typeof HealthReminderResponseDto>;
