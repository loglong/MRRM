import { z } from 'zod';
export declare const UpdateTouchpointSchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["VISIT", "CALL", "MESSAGE", "EMAIL", "WECHAT", "VIDEO", "SMS", "OTHER"]>>;
    channel: z.ZodOptional<z.ZodOptional<z.ZodEnum<["OFFLINE", "ONLINE", "MOBILE", "PHONE"]>>>;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    sentiment: z.ZodOptional<z.ZodOptional<z.ZodEnum<["POSITIVE", "NEUTRAL", "NEGATIVE"]>>>;
    duration: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    outcome: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    followupRequired: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    followupDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    patientId?: string | undefined;
    type?: "OTHER" | "WECHAT" | "VISIT" | "CALL" | "MESSAGE" | "EMAIL" | "VIDEO" | "SMS" | undefined;
    title?: string | undefined;
    channel?: "PHONE" | "OFFLINE" | "ONLINE" | "MOBILE" | undefined;
    content?: string | undefined;
    sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | undefined;
    duration?: number | undefined;
    outcome?: string | undefined;
    followupRequired?: boolean | undefined;
    followupDate?: string | undefined;
}, {
    patientId?: string | undefined;
    type?: "OTHER" | "WECHAT" | "VISIT" | "CALL" | "MESSAGE" | "EMAIL" | "VIDEO" | "SMS" | undefined;
    title?: string | undefined;
    channel?: "PHONE" | "OFFLINE" | "ONLINE" | "MOBILE" | undefined;
    content?: string | undefined;
    sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | undefined;
    duration?: number | undefined;
    outcome?: string | undefined;
    followupRequired?: boolean | undefined;
    followupDate?: string | undefined;
}>;
export type UpdateTouchpointDto = z.infer<typeof UpdateTouchpointSchema>;
