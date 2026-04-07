"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthRecordResponseDto = exports.UpdateHealthRecordDto = exports.CreateHealthRecordDto = exports.HealthRecordCategoryEnum = void 0;
const zod_1 = require("zod");
exports.HealthRecordCategoryEnum = zod_1.z.enum([
    'ALLERGY',
    'PAST_HISTORY',
    'EXAM_RESULT',
    'DIAGNOSIS',
    'TREATMENT',
]);
exports.CreateHealthRecordDto = zod_1.z.object({
    category: exports.HealthRecordCategoryEnum,
    title: zod_1.z.string().min(1, 'Title is required').max(200),
    description: zod_1.z.string().optional(),
    recordDate: zod_1.z.string().datetime(),
    data: zod_1.z.record(zod_1.z.any()).optional(),
    source: zod_1.z.string().default('manual'),
});
exports.UpdateHealthRecordDto = zod_1.z.object({
    category: exports.HealthRecordCategoryEnum.optional(),
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().optional(),
    recordDate: zod_1.z.string().datetime().optional(),
    data: zod_1.z.record(zod_1.z.any()).optional(),
    source: zod_1.z.string().optional(),
});
exports.HealthRecordResponseDto = zod_1.z.object({
    id: zod_1.z.string(),
    patientId: zod_1.z.string(),
    orgId: zod_1.z.string(),
    category: exports.HealthRecordCategoryEnum,
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    recordDate: zod_1.z.string(),
    data: zod_1.z.record(zod_1.z.any()).nullable(),
    source: zod_1.z.string(),
    createdAt: zod_1.z.string(),
});
//# sourceMappingURL=health-archive.dto.js.map