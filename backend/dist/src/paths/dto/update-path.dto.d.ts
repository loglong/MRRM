import { z } from 'zod';
export declare const UpdatePathDto: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "ACTIVE", "ARCHIVED"]>>;
    icd10Code: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    icd9Code: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    diagnosisName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    surgeryName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "ACTIVE" | "DRAFT" | "ARCHIVED" | undefined;
    description?: string | null | undefined;
    icd10Code?: string | null | undefined;
    icd9Code?: string | null | undefined;
    diagnosisName?: string | null | undefined;
    surgeryName?: string | null | undefined;
}, {
    name?: string | undefined;
    status?: "ACTIVE" | "DRAFT" | "ARCHIVED" | undefined;
    description?: string | null | undefined;
    icd10Code?: string | null | undefined;
    icd9Code?: string | null | undefined;
    diagnosisName?: string | null | undefined;
    surgeryName?: string | null | undefined;
}>;
export type UpdatePathDtoType = z.infer<typeof UpdatePathDto>;
