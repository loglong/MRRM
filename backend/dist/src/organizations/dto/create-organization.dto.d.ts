import { z } from 'zod';
export declare const CreateOrganizationDtoSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    domain: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    code: string;
    metadata?: Record<string, any> | undefined;
    domain?: string | undefined;
}, {
    name: string;
    code: string;
    metadata?: Record<string, any> | undefined;
    domain?: string | undefined;
}>;
export type CreateOrganizationDto = z.infer<typeof CreateOrganizationDtoSchema>;
