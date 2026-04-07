"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const roles_service_1 = require("./roles.service");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const logger_1 = require("../../common/logger");
describe('RolesService', () => {
    let service;
    let prisma;
    const mockPrismaService = {
        role: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findFirst: jest.fn(),
        },
        permission: {
            findMany: jest.fn(),
        },
        rolePermission: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        userRole: {
            count: jest.fn(),
            deleteMany: jest.fn(),
        },
    };
    const mockLogger = {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    };
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                roles_service_1.RolesService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
                { provide: logger_1.Logger, useValue: mockLogger },
            ],
        }).compile();
        service = module.get(roles_service_1.RolesService);
        prisma = module.get(prisma_service_1.PrismaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('findAll', () => {
        it('should return roles for an org with user count', async () => {
            const mockRoles = [
                {
                    id: '1',
                    name: 'Admin',
                    code: 'ADMIN',
                    description: 'Administrator',
                    isSystem: true,
                    _count: { users: 5 },
                },
            ];
            mockPrismaService.role.findMany.mockResolvedValue(mockRoles);
            const result = await service.findAll('org-1');
            expect(result).toEqual(mockRoles);
            expect(mockPrismaService.role.findMany).toHaveBeenCalledWith({
                where: { orgId: 'org-1' },
                include: { _count: { select: { users: true } } },
                orderBy: { createdAt: 'desc' },
            });
        });
    });
    describe('findById', () => {
        it('should return role by id with permissions', async () => {
            const mockRole = {
                id: '1',
                name: 'Admin',
                code: 'ADMIN',
                permissions: [{ permission: { id: '1', code: 'patient:read' } }],
            };
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
            const result = await service.findById('1');
            expect(result).toEqual(mockRole);
        });
    });
    describe('create', () => {
        it('should create a role with permissions', async () => {
            const createDto = {
                name: 'Doctor',
                code: 'DOCTOR',
                description: 'Doctor role',
                orgId: 'org-1',
                permissionIds: ['p1', 'p2'],
            };
            const mockCreatedRole = { id: '1', ...createDto, isSystem: false };
            const mockRoleWithRelations = {
                ...mockCreatedRole,
                permissions: [{ permission: { id: 'p1', code: 'patient:read' } }],
                _count: { users: 0 },
            };
            mockPrismaService.role.create.mockResolvedValue(mockCreatedRole);
            mockPrismaService.role.findUnique.mockResolvedValue(mockRoleWithRelations);
            mockPrismaService.rolePermission.createMany.mockResolvedValue({ count: 2 });
            const result = await service.create(createDto);
            expect(result.id).toEqual('1');
            expect(mockPrismaService.role.create).toHaveBeenCalled();
            expect(mockPrismaService.rolePermission.createMany).toHaveBeenCalled();
        });
    });
    describe('update', () => {
        it('should update role and its permissions', async () => {
            const updateDto = {
                name: 'Updated Doctor',
                permissionIds: ['p1', 'p3'],
            };
            const mockRole = { id: '1', name: 'Updated Doctor', isSystem: false };
            const mockUpdatedRole = {
                ...mockRole,
                permissions: [{ permission: { id: 'p1', code: 'patient:read' } }],
                _count: { users: 2 },
            };
            mockPrismaService.role.findUnique.mockResolvedValueOnce(mockRole).mockResolvedValueOnce(mockUpdatedRole);
            mockPrismaService.role.update.mockResolvedValue(mockRole);
            mockPrismaService.rolePermission.deleteMany.mockResolvedValue({ count: 2 });
            mockPrismaService.rolePermission.createMany.mockResolvedValue({ count: 2 });
            const result = await service.update('1', updateDto);
            expect(result.name).toEqual('Updated Doctor');
            expect(mockPrismaService.rolePermission.deleteMany).toHaveBeenCalled();
            expect(mockPrismaService.rolePermission.createMany).toHaveBeenCalled();
        });
    });
    describe('delete', () => {
        it('should soft delete a non-system role', async () => {
            const mockRole = { id: '1', isSystem: false, code: 'TEST', orgId: 'org-1' };
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
            mockPrismaService.role.delete.mockResolvedValue(mockRole);
            const result = await service.delete('1');
            expect(result).toEqual(mockRole);
            expect(mockPrismaService.rolePermission.deleteMany).toHaveBeenCalledWith({ where: { roleId: '1' } });
            expect(mockPrismaService.userRole.deleteMany).toHaveBeenCalledWith({ where: { roleId: '1' } });
            expect(mockPrismaService.role.delete).toHaveBeenCalledWith({ where: { id: '1' } });
        });
        it('should throw error when deleting system role', async () => {
            const mockRole = { id: '1', isSystem: true };
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
            await expect(service.delete('1')).rejects.toThrow('Cannot delete system role');
        });
    });
    describe('seedDefaultRoles', () => {
        it('should create default roles if none exist', async () => {
            mockPrismaService.role.findMany.mockResolvedValue([]);
            mockPrismaService.permission.findMany.mockResolvedValue([
                { id: 'p1', code: 'menu:dashboard', name: 'Dashboard', type: 'MENU' },
            ]);
            mockPrismaService.role.create.mockResolvedValue({ id: '1', code: 'SYSTEM_ADMIN', orgId: 'default-org' });
            await service.seedDefaultRoles();
            expect(mockPrismaService.role.create).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=roles.service.spec.js.map