"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const permissions_service_1 = require("./permissions.service");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const logger_1 = require("../../common/logger");
describe('PermissionsService', () => {
    let service;
    let prisma;
    const mockPrismaService = {
        permission: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            createMany: jest.fn(),
            findFirst: jest.fn(),
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
                permissions_service_1.PermissionsService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
                { provide: logger_1.Logger, useValue: mockLogger },
            ],
        }).compile();
        service = module.get(permissions_service_1.PermissionsService);
        prisma = module.get(prisma_service_1.PrismaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('findAll', () => {
        it('should return all permissions', async () => {
            const mockPermissions = [
                { id: '1', code: 'patient:read', name: 'View Patients', type: 'BUTTON', menuPath: null },
                { id: '2', code: 'menu:patients', name: 'Patients Menu', type: 'MENU', menuPath: '/patients' },
            ];
            mockPrismaService.permission.findMany.mockResolvedValue(mockPermissions);
            const result = await service.findAll();
            expect(result).toEqual(mockPermissions);
            expect(mockPrismaService.permission.findMany).toHaveBeenCalledWith({
                orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
            });
        });
    });
    describe('findByCode', () => {
        it('should return permission by code', async () => {
            const mockPermission = { id: '1', code: 'patient:read', name: 'View Patients', type: 'BUTTON' };
            mockPrismaService.permission.findUnique.mockResolvedValue(mockPermission);
            const result = await service.findByCode('patient:read');
            expect(result).toEqual(mockPermission);
            expect(mockPrismaService.permission.findUnique).toHaveBeenCalledWith({
                where: { code: 'patient:read' },
            });
        });
        it('should return null if permission not found', async () => {
            mockPrismaService.permission.findUnique.mockResolvedValue(null);
            const result = await service.findByCode('nonexistent');
            expect(result).toBeNull();
        });
    });
    describe('seedDefaultPermissions', () => {
        it('should create default permissions if none exist', async () => {
            mockPrismaService.permission.findMany.mockResolvedValue([]);
            mockPrismaService.permission.createMany.mockResolvedValue({ count: 32 });
            await service.seedDefaultPermissions();
            expect(mockPrismaService.permission.createMany).toHaveBeenCalled();
        });
        it('should not create permissions if they already exist', async () => {
            mockPrismaService.permission.findMany.mockResolvedValue([
                { id: '1', code: 'patient:read' },
            ]);
            await service.seedDefaultPermissions();
            expect(mockPrismaService.permission.createMany).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=permissions.service.spec.js.map