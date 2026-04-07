"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDtoSchema = void 0;
const zod_1 = require("zod");
exports.RegisterDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be at most 128 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    name: zod_1.z.string().min(1, 'Name is required').max(100),
    phone: zod_1.z.string().optional(),
    orgId: zod_1.z.string().optional(),
});
//# sourceMappingURL=register.dto.js.map