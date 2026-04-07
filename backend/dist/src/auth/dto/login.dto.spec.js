"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const login_dto_1 = require("./login.dto");
describe('LoginDtoSchema', () => {
    describe('valid inputs', () => {
        it('should pass with email and password only', () => {
            const result = login_dto_1.LoginDtoSchema.safeParse({ email: 'test@example.com', password: 'password123' });
            expect(result.success).toBe(true);
        });
        it('should pass with rememberMe set to true', () => {
            const result = login_dto_1.LoginDtoSchema.safeParse({ email: 'test@example.com', password: 'password123', rememberMe: true });
            expect(result.success).toBe(true);
        });
        it('should pass with optional orgId', () => {
            const result = login_dto_1.LoginDtoSchema.safeParse({ email: 'test@example.com', password: 'password123', orgId: 'org-123' });
            expect(result.success).toBe(true);
        });
    });
    describe('invalid inputs', () => {
        it('should fail when email is missing', () => {
            const result = login_dto_1.LoginDtoSchema.safeParse({ password: 'password123' });
            expect(result.success).toBe(false);
        });
        it('should fail when email format is invalid', () => {
            const result = login_dto_1.LoginDtoSchema.safeParse({ email: 'not-an-email', password: 'password123' });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe('Invalid email format');
            }
        });
        it('should fail when password is empty', () => {
            const result = login_dto_1.LoginDtoSchema.safeParse({ email: 'test@example.com', password: '' });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe('Password is required');
            }
        });
        it('should fail when rememberMe is wrong type (string instead of boolean)', () => {
            const result = login_dto_1.LoginDtoSchema.safeParse({ email: 'test@example.com', password: 'password123', rememberMe: 'yes' });
            expect(result.success).toBe(false);
        });
    });
});
//# sourceMappingURL=login.dto.spec.js.map