"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_context_1 = require("./auth-context");
describe('AuthContext', () => {
    const mockUser = {
        userId: 'user-123',
        orgId: 'org-456',
        role: 'ADMIN',
    };
    beforeEach(() => {
        auth_context_1.AuthContext.clear();
    });
    afterAll(() => {
        auth_context_1.AuthContext.clear();
    });
    describe('set and current', () => {
        it('should return the user set via set()', () => {
            auth_context_1.AuthContext.set(mockUser);
            expect(auth_context_1.AuthContext.current()).toEqual(mockUser);
        });
        it('should return null after clear()', () => {
            auth_context_1.AuthContext.set(mockUser);
            auth_context_1.AuthContext.clear();
            expect(auth_context_1.AuthContext.current()).toBeNull();
        });
    });
    describe('getOrgId', () => {
        it('should return the user orgId', () => {
            auth_context_1.AuthContext.set(mockUser);
            expect(auth_context_1.AuthContext.getOrgId()).toBe('org-456');
        });
        it('should return null when no user is set', () => {
            expect(auth_context_1.AuthContext.getOrgId()).toBeNull();
        });
    });
    describe('getUserId', () => {
        it('should return the user userId', () => {
            auth_context_1.AuthContext.set(mockUser);
            expect(auth_context_1.AuthContext.getUserId()).toBe('user-123');
        });
        it('should return null when no user is set', () => {
            expect(auth_context_1.AuthContext.getUserId()).toBeNull();
        });
    });
    describe('initial state', () => {
        it('should return null for current() at start', () => {
            expect(auth_context_1.AuthContext.current()).toBeNull();
        });
    });
});
//# sourceMappingURL=auth-context.spec.js.map