"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFollowupPlanSchema = void 0;
const zod_1 = require("zod");
exports.CreateFollowupPlanSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(200),
    type: zod_1.z.enum(['ROUTINE', 'POST_TREATMENT', 'PRE_APPOINTMENT', 'CUSTOM']).optional().default('ROUTINE'),
    frequencyDays: zod_1.z.number().int().positive().optional(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime().optional(),
    assignedUserId: zod_1.z.string().uuid().optional(),
    pathInstanceStepId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=create-followup-plan.dto.js.map