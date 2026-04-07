"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowupRecordFiltersSchema = exports.FollowupPlanFiltersSchema = void 0;
const zod_1 = require("zod");
exports.FollowupPlanFiltersSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.string().optional(),
    assignedUserId: zod_1.z.string().uuid().optional(),
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(100).default(20),
});
exports.FollowupRecordFiltersSchema = zod_1.z.object({
    planId: zod_1.z.string().uuid().optional(),
    patientId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.string().optional(),
    fromDate: zod_1.z.string().datetime().optional(),
    toDate: zod_1.z.string().datetime().optional(),
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(100).default(20),
});
//# sourceMappingURL=followup-filters.dto.js.map