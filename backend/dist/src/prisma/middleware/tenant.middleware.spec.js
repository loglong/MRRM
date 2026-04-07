"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_middleware_1 = require("./tenant.middleware");
const auth_context_1 = require("../../common/auth/auth-context");
describe('TenantMiddleware', () => {
    let middleware;
    let prismaService;
    let nextMock;
    const mockUser = { userId: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    beforeEach(() => {
        auth_context_1.AuthContext.clear();
        nextMock = jest.fn().mockResolvedValue(undefined);
        prismaService = {
            $use: jest.fn(),
        };
        middleware = new tenant_middleware_1.TenantMiddleware(prismaService);
    });
    afterAll(() => {
        auth_context_1.AuthContext.clear();
    });
    describe('model classification', () => {
        it('should skip Organization (system model)', () => {
            auth_context_1.AuthContext.set(mockUser);
            middleware.onModuleInit();
            const registeredUse = prismaService.$use.mock.calls[0][0];
            const params = { action: 'findMany', model: 'Organization', args: {} };
            registeredUse(params, nextMock);
            expect(nextMock).toHaveBeenCalled();
        });
        it('should skip Permission (system model)', () => {
            auth_context_1.AuthContext.set(mockUser);
            middleware.onModuleInit();
            const registeredUse = prismaService.$use.mock.calls[0][0];
            const params = { action: 'findMany', model: 'Permission', args: {} };
            registeredUse(params, nextMock);
            expect(nextMock).toHaveBeenCalled();
        });
        it('should apply filter to User (tenant-aware model)', () => {
            auth_context_1.AuthContext.set(mockUser);
            middleware.onModuleInit();
            const registeredUse = prismaService.$use.mock.calls[0][0];
            const params = { action: 'findMany', model: 'User', args: {} };
            registeredUse(params, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ args: expect.objectContaining({ where: { orgId: 'org-1' } }) }));
        });
        it('should apply filter to Patient (tenant-aware model)', () => {
            auth_context_1.AuthContext.set(mockUser);
            middleware.onModuleInit();
            const registeredUse = prismaService.$use.mock.calls[0][0];
            const params = { action: 'findMany', model: 'Patient', args: {} };
            registeredUse(params, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ args: expect.objectContaining({ where: { orgId: 'org-1' } }) }));
        });
    });
    describe('context sensitivity', () => {
        it('should skip when no AuthContext (seed/migrations)', () => {
            middleware.onModuleInit();
            const registeredUse = prismaService.$use.mock.calls[0][0];
            const params = { action: 'findMany', model: 'User', args: {} };
            registeredUse(params, nextMock);
            expect(nextMock).toHaveBeenCalledWith(params);
        });
        it('should skip non-model operations (findRaw, aggregate, groupBy)', () => {
            auth_context_1.AuthContext.set(mockUser);
            middleware.onModuleInit();
            const registeredUse = prismaService.$use.mock.calls[0][0];
            for (const action of ['findRaw', 'aggregate', 'groupBy']) {
                const params = { action, model: 'User', args: {} };
                nextMock.mockClear();
                registeredUse(params, nextMock);
                expect(nextMock).toHaveBeenCalledWith(params);
            }
        });
    });
    describe('orgId filter handling', () => {
        it('should preserve existing filters and add orgId', () => {
            auth_context_1.AuthContext.set(mockUser);
            middleware.onModuleInit();
            const registeredUse = prismaService.$use.mock.calls[0][0];
            const params = { action: 'findMany', model: 'User', args: { where: { name: 'John' } } };
            registeredUse(params, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ args: expect.objectContaining({ where: { name: 'John', orgId: 'org-1' } }) }));
        });
        it('should add orgId to empty where clause', () => {
            auth_context_1.AuthContext.set(mockUser);
            middleware.onModuleInit();
            const registeredUse = prismaService.$use.mock.calls[0][0];
            const params = { action: 'findMany', model: 'User', args: {} };
            registeredUse(params, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ args: { where: { orgId: 'org-1' } } }));
        });
    });
});
//# sourceMappingURL=tenant.middleware.spec.js.map