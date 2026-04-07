"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDemandDto = void 0;
const zod_1 = require("zod");
exports.CreateDemandDto = zod_1.z.object({
    patientId: zod_1.z.string().uuid('Invalid patient ID'),
    type: zod_1.z.enum(['CONSULTATION', 'TREATMENT', 'FOLLOWUP', 'OTHER']),
    title: zod_1.z.string().min(1, 'Title is required').max(100),
    description: zod_1.z.string().min(1, 'Description is required').max(1000),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    source: zod_1.z.enum(['PHONE', 'WECHAT', 'WEB', 'WALK_IN', 'REFERRAL', 'CAMPAIGN', 'OTHER']).optional(),
    estimatedAmount: zod_1.z.number().positive().optional().nullable(),
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
//# sourceMappingURL=create-demand.dto.js.map