"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrganizationDtoSchema = void 0;
const zod_1 = require("zod");
exports.CreateOrganizationDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Organization name is required').max(200),
    code: zod_1.z.string().min(1, 'Organization code is required').max(50).regex(/^[A-Z0-9_-]+$/i, 'Code must be alphanumeric'),
    domain: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
//# sourceMappingURL=create-organization.dto.js.map