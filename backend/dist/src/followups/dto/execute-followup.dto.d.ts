import { z } from 'zod';
export declare const ExecuteFollowupSchema: z.ZodObject<{
    outcome: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    outcome?: string | undefined;
    notes?: string | undefined;
}, {
    outcome?: string | undefined;
    notes?: string | undefined;
}>;
export type ExecuteFollowupDto = z.infer<typeof ExecuteFollowupSchema>;
