"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignPathDto = void 0;
const zod_1 = require("zod");
exports.AssignPathDto = zod_1.z.object({
    patientId: zod_1.z.string().uuid('Invalid patient ID'),
    demandId: zod_1.z.string().uuid('Invalid demand ID'),
    startDate: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=assign-path.dto.js.map