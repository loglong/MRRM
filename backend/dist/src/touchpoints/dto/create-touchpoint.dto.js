"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTouchpointSchema = void 0;
const zod_1 = require("zod");
exports.CreateTouchpointSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['VISIT', 'CALL', 'MESSAGE', 'EMAIL', 'WECHAT', 'VIDEO', 'SMS', 'OTHER']),
    channel: zod_1.z.enum(['OFFLINE', 'ONLINE', 'MOBILE', 'PHONE']).optional(),
    title: zod_1.z.string().min(1).max(200),
    content: zod_1.z.string().optional(),
    sentiment: zod_1.z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
    duration: zod_1.z.number().int().positive().optional(),
    outcome: zod_1.z.string().optional(),
    followupRequired: zod_1.z.boolean().optional(),
    followupDate: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=create-touchpoint.dto.js.map