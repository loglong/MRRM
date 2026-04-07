"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrganizationDtoSchema = void 0;
const zod_1 = require("zod");
exports.UpdateOrganizationDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).optional(),
    domain: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
//# sourceMappingURL=update-organization.dto.js.map