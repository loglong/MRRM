"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteFollowupSchema = void 0;
const zod_1 = require("zod");
exports.ExecuteFollowupSchema = zod_1.z.object({
    outcome: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
//# sourceMappingURL=execute-followup.dto.js.map