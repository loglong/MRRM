"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePatientDto = void 0;
const zod_1 = require("zod");
exports.CreatePatientDto = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100),
    phone: zod_1.z.string().max(20).optional(),
    email: zod_1.z.string().email().optional().nullable(),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).optional().nullable(),
    birthDate: zod_1.z.string().datetime().optional().nullable(),
    allergyHistory: zod_1.z.string().optional(),
    pastHistory: zod_1.z.string().optional(),
    address: zod_1.z.string().optional().nullable(),
    tier: zod_1.z.enum(['HIGH_VALUE', 'REGULAR', 'LOST_RISK']).optional(),
});
//# sourceMappingURL=create-patient.dto.js.map