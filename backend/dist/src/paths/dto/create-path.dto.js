"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePathDto = void 0;
const zod_1 = require("zod");
exports.CreatePathDto = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(200),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
    icd10Code: zod_1.z.string().max(20).optional(),
    icd9Code: zod_1.z.string().max(20).optional(),
    diagnosisName: zod_1.z.string().max(200).optional(),
    surgeryName: zod_1.z.string().max(200).optional(),
});
//# sourceMappingURL=create-path.dto.js.map