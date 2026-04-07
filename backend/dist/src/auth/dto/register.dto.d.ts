import { z } from 'zod';
export declare const RegisterDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    orgId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    phone?: string | undefined;
    orgId?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    phone?: string | undefined;
    orgId?: string | undefined;
}>;
export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
