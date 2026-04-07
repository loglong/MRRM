"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginDtoSchema = void 0;
const zod_1 = require("zod");
exports.LoginDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
    orgId: zod_1.z.string().optional(),
    rememberMe: zod_1.z.boolean().optional().default(false),
});
//# sourceMappingURL=login.dto.js.map