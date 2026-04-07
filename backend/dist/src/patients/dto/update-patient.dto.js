"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePatientDto = void 0;
const zod_1 = require("zod");
exports.UpdatePatientDto = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    phone: zod_1.z.string().max(20).optional().nullable(),
    email: zod_1.z.string().email().optional().nullable(),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).optional().nullable(),
    birthDate: zod_1.z.string().datetime().optional().nullable(),
    allergyHistory: zod_1.z.string().optional().nullable(),
    pastHistory: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    tier: zod_1.z.enum(['HIGH_VALUE', 'REGULAR', 'LOST_RISK']).optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'CHURNED', 'DECEASED']).optional(),
    assignedUserId: zod_1.z.string().uuid().optional().nullable(),
    lastVisitAt: zod_1.z.string().datetime().optional().nullable(),
    nextVisitAt: zod_1.z.string().datetime().optional().nullable(),
});
//# sourceMappingURL=update-patient.dto.js.map