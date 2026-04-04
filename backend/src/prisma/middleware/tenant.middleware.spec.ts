import { TenantMiddleware } from './tenant.middleware';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthContext, AuthUser } from '../../common/auth/auth-context';
import { Prisma } from '@prisma/client';

describe('TenantMiddleware', () => {
  let middleware: TenantMiddleware;
  let prismaService: Partial<PrismaService>;
  let nextMock: jest.Mock;

  const mockUser: AuthUser = { userId: 'user-1', orgId: 'org-1', role: 'ADMIN' };

  beforeEach(() => {
    AuthContext.clear();
    nextMock = jest.fn().mockResolvedValue(undefined);
    prismaService = {
      $use: jest.fn(),
    };
    middleware = new TenantMiddleware(prismaService as any);
  });

  afterAll(() => {
    AuthContext.clear();
  });

  describe('model classification', () => {
    it('should skip Organization (system model)', () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'findMany', model: 'Organization', args: {} } as any;
      registeredUse(params, nextMock);
      expect(nextMock).toHaveBeenCalled();
    });

    it('should skip Permission (system model)', () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'findMany', model: 'Permission', args: {} } as any;
      registeredUse(params, nextMock);
      expect(nextMock).toHaveBeenCalled();
    });

    it('should apply filter to User (tenant-aware model)', () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'findMany', model: 'User', args: {} } as any;
      registeredUse(params, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({ args: expect.objectContaining({ where: { orgId: 'org-1' } }) }),
      );
    });

    it('should apply filter to Patient (tenant-aware model)', () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'findMany', model: 'Patient', args: {} } as any;
      registeredUse(params, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({ args: expect.objectContaining({ where: { orgId: 'org-1' } }) }),
      );
    });
  });

  describe('context sensitivity', () => {
    it('should skip when no AuthContext (seed/migrations)', () => {
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'findMany', model: 'User', args: {} } as any;
      registeredUse(params, nextMock);
      expect(nextMock).toHaveBeenCalledWith(params);
    });

    it('should skip non-model operations (findRaw, aggregate, groupBy)', () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];

      for (const action of ['findRaw', 'aggregate', 'groupBy']) {
        const params = { action, model: 'User', args: {} } as any;
        nextMock.mockClear();
        registeredUse(params, nextMock);
        expect(nextMock).toHaveBeenCalledWith(params);
      }
    });
  });

  describe('orgId filter handling', () => {
    it('should preserve existing filters and add orgId', () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'findMany', model: 'User', args: { where: { name: 'John' } } } as any;
      registeredUse(params, nextMock);
      // Middleware adds orgId while preserving user's name filter
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({ args: expect.objectContaining({ where: { name: 'John', orgId: 'org-1' } }) }),
      );
    });

    it('should add orgId to empty where clause', () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'findMany', model: 'User', args: {} } as any;
      registeredUse(params, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({ args: { where: { orgId: 'org-1' } } }),
      );
    });
  });
});
