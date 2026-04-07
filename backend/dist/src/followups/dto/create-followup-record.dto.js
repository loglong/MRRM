"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFollowupRecordSchema = void 0;
const zod_1 = require("zod");
exports.CreateFollowupRecordSchema = zod_1.z.object({
    planId: zod_1.z.string().uuid(),
    scheduledAt: zod_1.z.string().datetime(),
    pathInstanceStepId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=create-followup-record.dto.js.map