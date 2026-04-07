"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthReminderResponseDto = exports.CreateHealthReminderDto = exports.ReminderStatusEnum = exports.ReminderTypeEnum = void 0;
const zod_1 = require("zod");
exports.ReminderTypeEnum = zod_1.z.enum(['REVIEW', 'MEDICATION']);
exports.ReminderStatusEnum = zod_1.z.enum(['PENDING', 'COMPLETED', 'CANCELLED']);
exports.CreateHealthReminderDto = zod_1.z.object({
    patientId: zod_1.z.string().uuid(),
    type: exports.ReminderTypeEnum,
    title: zod_1.z.string().min(1, 'Title is required').max(200),
    content: zod_1.z.string().optional(),
    remindAt: zod_1.z.string().datetime(),
});
exports.HealthReminderResponseDto = zod_1.z.object({
    id: zod_1.z.string(),
    patientId: zod_1.z.string(),
    orgId: zod_1.z.string(),
    type: exports.ReminderTypeEnum,
    title: zod_1.z.string(),
    content: zod_1.z.string().nullable(),
    remindAt: zod_1.z.string(),
    status: exports.ReminderStatusEnum,
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
//# sourceMappingURL=health-reminder.dto.js.map