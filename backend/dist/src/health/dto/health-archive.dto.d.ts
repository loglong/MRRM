import { z } from 'zod';
export declare const HealthRecordCategoryEnum: z.ZodEnum<["ALLERGY", "PAST_HISTORY", "EXAM_RESULT", "DIAGNOSIS", "TREATMENT"]>;
export declare const CreateHealthRecordDto: z.ZodObject<{
    category: z.ZodEnum<["ALLERGY", "PAST_HISTORY", "EXAM_RESULT", "DIAGNOSIS", "TREATMENT"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    recordDate: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    source: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source: string;
    title: string;
    category: "TREATMENT" | "ALLERGY" | "PAST_HISTORY" | "EXAM_RESULT" | "DIAGNOSIS";
    recordDate: string;
    description?: string | undefined;
    data?: Record<string, any> | undefined;
}, {
    title: string;
    category: "TREATMENT" | "ALLERGY" | "PAST_HISTORY" | "EXAM_RESULT" | "DIAGNOSIS";
    recordDate: string;
    source?: string | undefined;
    description?: string | undefined;
    data?: Record<string, any> | undefined;
}>;
export type CreateHealthRecordDtoType = z.infer<typeof CreateHealthRecordDto>;
export declare const UpdateHealthRecordDto: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<["ALLERGY", "PAST_HISTORY", "EXAM_RESULT", "DIAGNOSIS", "TREATMENT"]>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    recordDate: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    source: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    data?: Record<string, any> | undefined;
    category?: "TREATMENT" | "ALLERGY" | "PAST_HISTORY" | "EXAM_RESULT" | "DIAGNOSIS" | undefined;
    recordDate?: string | undefined;
}, {
    source?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    data?: Record<string, any> | undefined;
    category?: "TREATMENT" | "ALLERGY" | "PAST_HISTORY" | "EXAM_RESULT" | "DIAGNOSIS" | undefined;
    recordDate?: string | undefined;
}>;
export type UpdateHealthRecordDtoType = z.infer<typeof UpdateHealthRecordDto>;
export declare const HealthRecordResponseDto: z.ZodObject<{
    id: z.ZodString;
    patientId: z.ZodString;
    orgId: z.ZodString;
    category: z.ZodEnum<["ALLERGY", "PAST_HISTORY", "EXAM_RESULT", "DIAGNOSIS", "TREATMENT"]>;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    recordDate: z.ZodString;
    data: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>;
    source: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    orgId: string;
    createdAt: string;
    patientId: string;
    source: string;
    title: string;
    description: string | null;
    data: Record<string, any> | null;
    category: "TREATMENT" | "ALLERGY" | "PAST_HISTORY" | "EXAM_RESULT" | "DIAGNOSIS";
    recordDate: string;
}, {
    id: string;
    orgId: string;
    createdAt: string;
    patientId: string;
    source: string;
    title: string;
    description: string | null;
    data: Record<string, any> | null;
    category: "TREATMENT" | "ALLERGY" | "PAST_HISTORY" | "EXAM_RESULT" | "DIAGNOSIS";
    recordDate: string;
}>;
export type HealthRecordResponseType = z.infer<typeof HealthRecordResponseDto>;
