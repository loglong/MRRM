"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeStatusDemandDto = void 0;
const zod_1 = require("zod");
exports.ChangeStatusDemandDto = zod_1.z.object({
    status: zod_1.z.enum(['OPEN', 'IN_PROGRESS', 'PENDING', 'FULFILLED', 'CANCELLED', 'LOST']),
    notes: zod_1.z.string().max(500).optional().nullable(),
});
//# sourceMappingURL=change-status-demand.dto.js.map