import { z } from 'zod';
export declare const CreatePathStepDto: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    stepOrder: z.ZodNumber;
    stepType: z.ZodOptional<z.ZodEnum<["START", "TASK", "AUTOMATED_ACTION", "WAIT", "DECISION", "END"]>>;
    estimatedDays: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    timeoutHours: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    triggerAction: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notificationTemplate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    stepOrder: number;
    description?: string | null | undefined;
    stepType?: "START" | "TASK" | "AUTOMATED_ACTION" | "WAIT" | "DECISION" | "END" | undefined;
    estimatedDays?: number | null | undefined;
    timeoutHours?: number | null | undefined;
    triggerAction?: string | null | undefined;
    notificationTemplate?: string | null | undefined;
}, {
    name: string;
    stepOrder: number;
    description?: string | null | undefined;
    stepType?: "START" | "TASK" | "AUTOMATED_ACTION" | "WAIT" | "DECISION" | "END" | undefined;
    estimatedDays?: number | null | undefined;
    timeoutHours?: number | null | undefined;
    triggerAction?: string | null | undefined;
    notificationTemplate?: string | null | undefined;
}>;
export type CreatePathStepDtoType = z.infer<typeof CreatePathStepDto>;
