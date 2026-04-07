"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterDemandDto = void 0;
const zod_1 = require("zod");
exports.FilterDemandDto = zod_1.z.object({
    patientId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['OPEN', 'IN_PROGRESS', 'PENDING', 'FULFILLED', 'CANCELLED', 'LOST']).optional(),
    type: zod_1.z.enum(['CONSULTATION', 'TREATMENT', 'FOLLOWUP', 'OTHER']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    source: zod_1.z.enum(['PHONE', 'WECHAT', 'WEB', 'WALK_IN', 'REFERRAL', 'CAMPAIGN', 'OTHER']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(20),
});
//# sourceMappingURL=filter-demand.dto.js.map