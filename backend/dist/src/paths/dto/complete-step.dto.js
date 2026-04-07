"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipStepDto = exports.CompleteStepDto = void 0;
const zod_1 = require("zod");
exports.CompleteStepDto = zod_1.z.object({
    notes: zod_1.z.string().optional(),
});
exports.SkipStepDto = zod_1.z.object({
    reason: zod_1.z.string().optional(),
});
//# sourceMappingURL=complete-step.dto.js.map