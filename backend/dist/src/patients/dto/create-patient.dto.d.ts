import { z } from 'zod';
export declare const CreatePatientDto: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    gender: z.ZodNullable<z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER", "UNKNOWN"]>>>;
    birthDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    allergyHistory: z.ZodOptional<z.ZodString>;
    pastHistory: z.ZodOptional<z.ZodString>;
    address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tier: z.ZodOptional<z.ZodEnum<["HIGH_VALUE", "REGULAR", "LOST_RISK"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone?: string | undefined;
    email?: string | null | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN" | null | undefined;
    birthDate?: string | null | undefined;
    allergyHistory?: string | undefined;
    pastHistory?: string | undefined;
    tier?: "HIGH_VALUE" | "REGULAR" | "LOST_RISK" | undefined;
    address?: string | null | undefined;
}, {
    name: string;
    phone?: string | undefined;
    email?: string | null | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN" | null | undefined;
    birthDate?: string | null | undefined;
    allergyHistory?: string | undefined;
    pastHistory?: string | undefined;
    tier?: "HIGH_VALUE" | "REGULAR" | "LOST_RISK" | undefined;
    address?: string | null | undefined;
}>;
export type CreatePatientDtoType = z.infer<typeof CreatePatientDto>;
