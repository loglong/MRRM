"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockedException = void 0;
const common_1 = require("@nestjs/common");
class LockedException extends common_1.HttpException {
    constructor(lockedUntil) {
        const retryAfterSeconds = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
        const response = {
            statusCode: 423,
            message: `Account locked until ${lockedUntil.toISOString()}`,
            error: 'Locked',
            lockedUntil: lockedUntil.toISOString(),
            retryAfter: retryAfterSeconds,
        };
        super(response, 423);
    }
}
exports.LockedException = LockedException;
//# sourceMappingURL=locked.exception.js.map