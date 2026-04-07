import { z } from 'zod';
export declare const CreateFollowupPlanSchema: z.ZodObject<{
    patientId: z.ZodString;
    name: z.ZodString;
    type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["ROUTINE", "POST_TREATMENT", "PRE_APPOINTMENT", "CUSTOM"]>>>;
    frequencyDays: z.ZodOptional<z.ZodNumber>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    assignedUserId: z.ZodOptional<z.ZodString>;
    pathInstanceStepId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    patientId: string;
    type: "ROUTINE" | "POST_TREATMENT" | "PRE_APPOINTMENT" | "CUSTOM";
    startDate: string;
    assignedUserId?: string | undefined;
    pathInstanceStepId?: string | undefined;
    frequencyDays?: number | undefined;
    endDate?: string | undefined;
}, {
    name: string;
    patientId: string;
    startDate: string;
    assignedUserId?: string | undefined;
    type?: "ROUTINE" | "POST_TREATMENT" | "PRE_APPOINTMENT" | "CUSTOM" | undefined;
    pathInstanceStepId?: string | undefined;
    frequencyDays?: number | undefined;
    endDate?: string | undefined;
}>;
export type CreateFollowupPlanDto = z.infer<typeof CreateFollowupPlanSchema>;
