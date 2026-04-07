import { z } from 'zod';
export declare const CreateTouchpointSchema: z.ZodObject<{
    patientId: z.ZodString;
    type: z.ZodEnum<["VISIT", "CALL", "MESSAGE", "EMAIL", "WECHAT", "VIDEO", "SMS", "OTHER"]>;
    channel: z.ZodOptional<z.ZodEnum<["OFFLINE", "ONLINE", "MOBILE", "PHONE"]>>;
    title: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    sentiment: z.ZodOptional<z.ZodEnum<["POSITIVE", "NEUTRAL", "NEGATIVE"]>>;
    duration: z.ZodOptional<z.ZodNumber>;
    outcome: z.ZodOptional<z.ZodString>;
    followupRequired: z.ZodOptional<z.ZodBoolean>;
    followupDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    type: "OTHER" | "WECHAT" | "VISIT" | "CALL" | "MESSAGE" | "EMAIL" | "VIDEO" | "SMS";
    title: string;
    channel?: "PHONE" | "OFFLINE" | "ONLINE" | "MOBILE" | undefined;
    content?: string | undefined;
    sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | undefined;
    duration?: number | undefined;
    outcome?: string | undefined;
    followupRequired?: boolean | undefined;
    followupDate?: string | undefined;
}, {
    patientId: string;
    type: "OTHER" | "WECHAT" | "VISIT" | "CALL" | "MESSAGE" | "EMAIL" | "VIDEO" | "SMS";
    title: string;
    channel?: "PHONE" | "OFFLINE" | "ONLINE" | "MOBILE" | undefined;
    content?: string | undefined;
    sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | undefined;
    duration?: number | undefined;
    outcome?: string | undefined;
    followupRequired?: boolean | undefined;
    followupDate?: string | undefined;
}>;
export type CreateTouchpointDto = z.infer<typeof CreateTouchpointSchema>;
