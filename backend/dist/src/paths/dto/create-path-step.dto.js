"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePathStepDto = void 0;
const zod_1 = require("zod");
exports.CreatePathStepDto = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(200),
    description: zod_1.z.string().optional().nullable(),
    stepOrder: zod_1.z.number().int().positive(),
    stepType: zod_1.z.enum(['START', 'TASK', 'AUTOMATED_ACTION', 'WAIT', 'DECISION', 'END']).optional(),
    estimatedDays: zod_1.z.number().int().positive().optional().nullable(),
    timeoutHours: zod_1.z.number().int().positive().optional().nullable(),
    triggerAction: zod_1.z.string().optional().nullable(),
    notificationTemplate: zod_1.z.string().optional().nullable(),
});
//# sourceMappingURL=create-path-step.dto.js.map