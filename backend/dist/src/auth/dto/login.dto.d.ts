import { z } from 'zod';
export declare const LoginDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    orgId: z.ZodOptional<z.ZodString>;
    rememberMe: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    rememberMe: boolean;
    orgId?: string | undefined;
}, {
    email: string;
    password: string;
    orgId?: string | undefined;
    rememberMe?: boolean | undefined;
}>;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
