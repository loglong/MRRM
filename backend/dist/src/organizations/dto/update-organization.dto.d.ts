import { z } from 'zod';
export declare const UpdateOrganizationDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    domain: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | undefined;
    metadata?: Record<string, any> | undefined;
    domain?: string | undefined;
}, {
    name?: string | undefined;
    status?: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | undefined;
    metadata?: Record<string, any> | undefined;
    domain?: string | undefined;
}>;
export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationDtoSchema>;
