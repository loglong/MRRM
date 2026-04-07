import { z } from 'zod';
export declare const CompleteStepDto: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
export type CompleteStepDtoType = z.infer<typeof CompleteStepDto>;
export declare const SkipStepDto: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export type SkipStepDtoType = z.infer<typeof SkipStepDto>;
