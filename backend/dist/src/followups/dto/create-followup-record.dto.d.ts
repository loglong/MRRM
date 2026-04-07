import { z } from 'zod';
export declare const CreateFollowupRecordSchema: z.ZodObject<{
    planId: z.ZodString;
    scheduledAt: z.ZodString;
    pathInstanceStepId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    planId: string;
    scheduledAt: string;
    pathInstanceStepId?: string | undefined;
}, {
    planId: string;
    scheduledAt: string;
    pathInstanceStepId?: string | undefined;
}>;
export type CreateFollowupRecordDto = z.infer<typeof CreateFollowupRecordSchema>;
