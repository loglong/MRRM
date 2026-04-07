"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TouchpointFiltersSchema = void 0;
const zod_1 = require("zod");
exports.TouchpointFiltersSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid().optional(),
    type: zod_1.z.string().optional(),
    channel: zod_1.z.string().optional(),
    sentiment: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(100).default(20),
});
//# sourceMappingURL=touchpoint-filters.dto.js.map