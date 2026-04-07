"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDemandDto = void 0;
const zod_1 = require("zod");
exports.UpdateDemandDto = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().max(1000).optional().nullable(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    source: zod_1.z.enum(['PHONE', 'WECHAT', 'WEB', 'WALK_IN', 'REFERRAL', 'CAMPAIGN', 'OTHER']).optional(),
    estimatedAmount: zod_1.z.number().positive().optional().nullable(),
    actualAmount: zod_1.z.number().positive().optional().nullable(),
    closeReason: zod_1.z.string().optional().nullable(),
    developmentManager: zod_1.z.string().optional().nullable(),
    preTreatmentStartDate: zod_1.z.string().datetime().optional().nullable(),
    preTreatmentManager: zod_1.z.string().optional().nullable(),
    treatmentStartDate: zod_1.z.string().datetime().optional().nullable(),
    treatmentManager: zod_1.z.string().optional().nullable(),
    treatmentEndDate: zod_1.z.string().datetime().optional().nullable(),
    pathId: zod_1.z.string().uuid().optional().nullable(),
    maintenanceManager: zod_1.z.string().optional().nullable(),
    maintenancePlanId: zod_1.z.string().optional().nullable(),
    demandEndDate: zod_1.z.string().datetime().optional().nullable(),
});
//# sourceMappingURL=update-demand.dto.js.map