import { z } from 'zod';
export declare const CreatePathDto: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "ACTIVE", "ARCHIVED"]>>;
    icd10Code: z.ZodOptional<z.ZodString>;
    icd9Code: z.ZodOptional<z.ZodString>;
    diagnosisName: z.ZodOptional<z.ZodString>;
    surgeryName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    status?: "ACTIVE" | "DRAFT" | "ARCHIVED" | undefined;
    description?: string | undefined;
    icd10Code?: string | undefined;
    icd9Code?: string | undefined;
    diagnosisName?: string | undefined;
    surgeryName?: string | undefined;
}, {
    name: string;
    status?: "ACTIVE" | "DRAFT" | "ARCHIVED" | undefined;
    description?: string | undefined;
    icd10Code?: string | undefined;
    icd9Code?: string | undefined;
    diagnosisName?: string | undefined;
    surgeryName?: string | undefined;
}>;
export type CreatePathDtoType = z.infer<typeof CreatePathDto>;
