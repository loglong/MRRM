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

    it('should apply filter to PathInstance (tenant-aware model)', () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'findMany', model: 'PathInstance', args: {} } as any;
      registeredUse(params, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({ args: expect.objectContaining({ where: { orgId: 'org-1' } }) }),
      );
    });

    it('should apply filter to Notification (tenant-aware model)', () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'findMany', model: 'Notification', args: {} } as any;
      registeredUse(params, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({ args: expect.objectContaining({ where: { orgId: 'org-1' } }) }),
      );
    });

    it('should apply filter to HealthRecord (tenant-aware model)', () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'findMany', model: 'HealthRecord', args: {} } as any;
      registeredUse(params, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({ args: expect.objectContaining({ where: { orgId: 'org-1' } }) }),
      );
    });

    it('should apply filter to HealthReminder (tenant-aware model)', () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'findMany', model: 'HealthReminder', args: {} } as any;
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

  describe('write operation validation', () => {
    it('should force correct orgId on create operations', async () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'create', model: 'Patient', args: { data: { name: 'John', phone: '123' } } } as any;
      await registeredUse(params, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({ args: expect.objectContaining({ data: expect.objectContaining({ orgId: 'org-1' }) }) }),
      );
    });

    it('should throw error when attempting to create resource in different org', async () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'create', model: 'Patient', args: { data: { name: 'John', orgId: 'different-org' } } } as any;
      await expect(registeredUse(params, nextMock)).rejects.toThrow('Access denied: cannot create/modify resources in another organization');
    });

    it('should force correct orgId on update operations', async () => {
      AuthContext.set(mockUser);
      middleware.onModuleInit();
      const registeredUse = (prismaService.$use as jest.Mock).mock.calls[0][0];
      const params = { action: 'update', model: 'Patient', args: { where: { id: 'patient-1' }, data: { name: 'Jane' } } } as any;
      await registeredUse(params, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({ args: expect.objectContaining({ data: expect.objectContaining({ orgId: 'org-1' }) }) }),
      );
    });
  });
});
