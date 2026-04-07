"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const patients_service_1 = require("./patients.service");
const prisma_service_1 = require("../common/prisma/prisma.service");
const encryption_service_1 = require("../common/encryption/encryption.service");
describe('PatientsService', () => {
    let service;
    let prisma;
    let encryption;
    const mockPrismaService = {
        patient: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
    };
    const mockEncryptionService = {
        encrypt: jest.fn((text) => `encrypted:${text}`),
        decrypt: jest.fn((text) => text.replace('encrypted:', '')),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                patients_service_1.PatientsService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
                { provide: encryption_service_1.EncryptionService, useValue: mockEncryptionService },
            ],
        }).compile();
        service = module.get(patients_service_1.PatientsService);
        prisma = module.get(prisma_service_1.PrismaService);
        encryption = module.get(encryption_service_1.EncryptionService);
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should create a patient with encrypted medical fields', async () => {
            const createDto = {
                name: 'Zhang Wei',
                phone: '13812345678',
                gender: 'MALE',
                allergyHistory: 'Penicillin allergy',
                pastHistory: 'Hypertension',
            };
            const expectedPatient = {
                id: 'uuid-1',
                name: 'Zhang Wei',
                phone: '13812345678',
                gender: 'MALE',
                allergyHistory: 'encrypted:Penicillin allergy',
                pastHistory: 'encrypted:Hypertension',
                tier: 'REGULAR',
                status: 'ACTIVE',
                orgId: 'org-1',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };
            mockPrismaService.patient.create.mockResolvedValue(expectedPatient);
            const result = await service.create(createDto, 'org-1');
            expect(result.allergyHistory).toBe('Penicillin allergy');
            expect(result.pastHistory).toBe('Hypertension');
            expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('Penicillin allergy');
            expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('Hypertension');
        });
        it('should default tier to REGULAR on create', async () => {
            const createDto = {
                name: 'Li Ming',
                phone: '13912345678',
                gender: 'FEMALE',
            };
            const expectedPatient = {
                id: 'uuid-2',
                name: 'Li Ming',
                phone: '13912345678',
                gender: 'FEMALE',
                tier: 'REGULAR',
                orgId: 'org-1',
            };
            mockPrismaService.patient.create.mockResolvedValue(expectedPatient);
            const result = await service.create(createDto, 'org-1');
            expect(result.tier).toBe('REGULAR');
        });
    });
    describe('findAll', () => {
        it('should return paginated patients', async () => {
            const patients = [
                { id: 'uuid-1', name: 'Zhang Wei', tier: 'REGULAR' },
                { id: 'uuid-2', name: 'Li Ming', tier: 'HIGH_VALUE' },
            ];
            mockPrismaService.patient.findMany.mockResolvedValue(patients);
            mockPrismaService.patient.count.mockResolvedValue(2);
            const result = await service.findAll('org-1', 1, 20);
            expect(result.data).toHaveLength(2);
            expect(result.pagination.total).toBe(2);
            expect(result.pagination.page).toBe(1);
        });
        it('should filter by tier', async () => {
            const patients = [
                { id: 'uuid-1', name: 'Zhang Wei', tier: 'HIGH_VALUE' },
            ];
            mockPrismaService.patient.findMany.mockResolvedValue(patients);
            mockPrismaService.patient.count.mockResolvedValue(1);
            const result = await service.findAll('org-1', 1, 20, { tier: 'HIGH_VALUE' });
            expect(result.data).toHaveLength(1);
            expect(mockPrismaService.patient.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ tier: 'HIGH_VALUE' }),
            }));
        });
    });
    describe('findById', () => {
        it('should return patient with decrypted medical fields', async () => {
            const patient = {
                id: 'uuid-1',
                name: 'Zhang Wei',
                allergyHistory: 'encrypted:Penicillin allergy',
                pastHistory: 'encrypted:Hypertension',
            };
            mockPrismaService.patient.findUnique.mockResolvedValue(patient);
            const result = await service.findById('uuid-1');
            expect(result.allergyHistory).toBe('Penicillin allergy');
            expect(result.pastHistory).toBe('Hypertension');
        });
    });
    describe('update', () => {
        it('should re-encrypt medical fields if changed', async () => {
            const updateDto = {
                allergyHistory: 'New allergy info',
            };
            mockPrismaService.patient.update.mockResolvedValue({
                id: 'uuid-1',
                allergyHistory: 'encrypted:New allergy info',
            });
            const result = await service.update('uuid-1', updateDto);
            expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('New allergy info');
        });
    });
    describe('delete', () => {
        it('should soft-delete patient by setting deletedAt', async () => {
            const deletedPatient = {
                id: 'uuid-1',
                deletedAt: new Date(),
            };
            mockPrismaService.patient.update.mockResolvedValue(deletedPatient);
            const result = await service.delete('uuid-1');
            expect(mockPrismaService.patient.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ deletedAt: expect.any(Date) }),
            }));
        });
    });
});
//# sourceMappingURL=patients.service.spec.js.map