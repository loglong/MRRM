"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePathDto = void 0;
const zod_1 = require("zod");
exports.UpdatePathDto = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
    icd10Code: zod_1.z.string().max(20).optional().nullable(),
    icd9Code: zod_1.z.string().max(20).optional().nullable(),
    diagnosisName: zod_1.z.string().max(200).optional().nullable(),
    surgeryName: zod_1.z.string().max(200).optional().nullable(),
});
//# sourceMappingURL=update-path.dto.js.map