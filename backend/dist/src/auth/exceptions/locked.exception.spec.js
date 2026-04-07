"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locked_exception_1 = require("./locked.exception");
describe('LockedException', () => {
    it('should have status code 423', () => {
        const futureDate = new Date(Date.now() + 30 * 60 * 1000);
        const exception = new locked_exception_1.LockedException(futureDate);
        expect(exception.getStatus()).toBe(423);
    });
    it('should include lockedUntil ISO string in response', () => {
        const futureDate = new Date(Date.now() + 30 * 60 * 1000);
        const exception = new locked_exception_1.LockedException(futureDate);
        const response = exception.getResponse();
        expect(response.lockedUntil).toBe(futureDate.toISOString());
    });
    it('should calculate retryAfter in seconds correctly', () => {
        const futureDate = new Date(Date.now() + 60 * 1000);
        const exception = new locked_exception_1.LockedException(futureDate);
        const response = exception.getResponse();
        expect(response.retryAfter).toBe(60);
    });
    it('should include ISO timestamp in message', () => {
        const futureDate = new Date(Date.now() + 30 * 60 * 1000);
        const exception = new locked_exception_1.LockedException(futureDate);
        const response = exception.getResponse();
        expect(response.message).toContain(futureDate.toISOString());
    });
});
//# sourceMappingURL=locked.exception.spec.js.map