"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const audit_service_1 = require("./audit.service");
const prisma_service_1 = require("../common/prisma/prisma.service");
describe('AuditService', () => {
    let service;
    let prisma;
    const mockLogs = [
        { id: '1', userId: 'u1', orgId: 'org-1', action: 'CREATE', entityType: 'Patient', createdAt: new Date(), user: { id: 'u1', name: 'John', email: 'j@example.com' } },
        { id: '2', userId: 'u2', orgId: 'org-1', action: 'UPDATE', entityType: 'Demand', createdAt: new Date(), user: { id: 'u2', name: 'Jane', email: 'jane@example.com' } },
    ];
    beforeEach(async () => {
        prisma = {
            auditLog: {
                create: jest.fn().mockResolvedValue({ id: '1' }),
                findMany: jest.fn().mockResolvedValue(mockLogs),
                count: jest.fn().mockResolvedValue(2),
            },
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                audit_service_1.AuditService,
                { provide: prisma_service_1.PrismaService, useValue: prisma },
            ],
        }).compile();
        service = module.get(audit_service_1.AuditService);
    });
    describe('findAll', () => {
        it('should return paginated response with data and pagination fields', async () => {
            const result = await service.findAll('org-1', 1, 50);
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('pagination');
            expect(result.data).toEqual(mockLogs);
            expect(result.pagination.total).toBe(2);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(50);
            expect(result.pagination.totalPages).toBe(1);
        });
        it('should apply date range 90-day limit', async () => {
            const start = new Date('2024-01-01');
            const end = new Date('2024-06-01');
            await expect(service.findAll('org-1', 1, 50, { createdAt: { gte: start, lte: end } })).rejects.toThrow('Date range cannot exceed 90 days');
        });
        it('should include user in findMany response', async () => {
            await service.findAll('org-1', 1, 50);
            expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
                include: expect.objectContaining({ user: { select: { id: true, name: true, email: true } } }),
            }));
        });
        it('should pass limit and skip to findMany', async () => {
            await service.findAll('org-1', 2, 25);
            expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 25, take: 25 }));
        });
    });
    describe('findByEntity', () => {
        it('should filter by entityType, entityId, and orgId', async () => {
            await service.findByEntity('Patient', 'p-123', 'org-1');
            expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { entityType: 'Patient', entityId: 'p-123', orgId: 'org-1' },
            }));
        });
        it('should include user in response', async () => {
            await service.findByEntity('Patient', 'p-123', 'org-1');
            expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
                include: expect.objectContaining({ user: { select: { id: true, name: true, email: true } } }),
            }));
        });
    });
    describe('getLogsForExport', () => {
        it('should limit to 10000 records', async () => {
            const start = new Date('2024-01-01');
            const end = new Date('2024-12-31');
            await service.getLogsForExport('org-1', start, end);
            expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10000 }));
        });
        it('should filter by orgId and date range', async () => {
            const start = new Date('2024-01-01');
            const end = new Date('2024-12-31');
            await service.getLogsForExport('org-1', start, end);
            expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { orgId: 'org-1', createdAt: { gte: start, lte: end } },
            }));
        });
    });
    describe('log', () => {
        it('should create audit log with all fields', async () => {
            const dto = {
                userId: 'u-1',
                orgId: 'org-1',
                action: 'CREATE',
                entityType: 'Patient',
                entityId: 'p-1',
                ipAddress: '127.0.0.1',
            };
            await service.log(dto);
            expect(prisma.auditLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ userId: 'u-1', orgId: 'org-1', action: 'CREATE' }),
            });
        });
        it('should not throw when Prisma create fails', async () => {
            prisma.auditLog.create.mockRejectedValueOnce(new Error('DB error'));
            const dto = { orgId: 'org-1', action: 'TEST', entityType: 'Test' };
            await expect(service.log(dto)).resolves.not.toThrow();
        });
    });
});
//# sourceMappingURL=audit.service.spec.js.map