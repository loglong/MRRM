import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { PatientSkillService } from './services/patient-skill.service';
import { ChurnPredictionService } from './services/churn-prediction.service';
import { FollowupRecommendationService } from './services/followup-recommendation.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AiAuditInterceptor } from './interceptors/ai-audit.interceptor';

describe('AiController', () => {
  let controller: AiController;
  let patientSkillService: PatientSkillService;

  const mockPatientSkillService = {
    searchPatients: jest.fn(),
    getPatientDetail: jest.fn(),
    createTouchpoint: jest.fn(),
    createFollowup: jest.fn(),
  };

  const mockChurnPredictionService = {
    calculateRiskScore: jest.fn(),
    getHighRiskPatients: jest.fn(),
  };

  const mockFollowupRecommendationService = {
    getRecommendation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        { provide: PatientSkillService, useValue: mockPatientSkillService },
        { provide: ChurnPredictionService, useValue: mockChurnPredictionService },
        { provide: FollowupRecommendationService, useValue: mockFollowupRecommendationService },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(AiAuditInterceptor)
      .useValue({ intercept: (context: any, next: any) => next.handle() })
      .compile();

    controller = module.get<AiController>(AiController);
    patientSkillService = module.get<PatientSkillService>(PatientSkillService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = controller.health();
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('ok');
    });
  });

  describe('searchPatients', () => {
    it('should return patient list', async () => {
      const mockResult = {
        patients: [{ id: '1', name: '张三', phone: '138****8888', tier: 'HIGH_VALUE', lastVisit: '2026-04-01', pendingDemands: 2, tags: ['VIP'] }],
        pagination: { total: 1, page: 1, limit: 20 },
      };
      mockPatientSkillService.searchPatients.mockResolvedValue(mockResult);

      const mockReq = {
        headers: { 'x-org-id': 'test-org' },
        aiKeyConfig: { orgId: 'test-org' }
      } as any;

      const result = await controller.searchPatients(
        { q: '张三', page: 1, limit: 20 } as any,
        mockReq
      ) as any;

      expect(result.success).toBe(true);
      expect(result.data.patients).toHaveLength(1);
      expect(result.data.patients[0].name).toBe('张三');
    });

    it('should return error when orgId is missing', async () => {
      const mockReq = {
        aiKeyConfig: {}
      } as any;

      const result = await controller.searchPatients(
        { q: '张三' } as any,
        mockReq
      ) as any;

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INVALID_ORG');
    });
  });

  describe('getPatientDetail', () => {
    it('should return patient detail', async () => {
      const mockResult = {
        id: '1',
        name: '张三',
        gender: '男',
        age: 45,
        phone: '138****8888',
        tier: 'HIGH_VALUE',
        medicalInfo: {
          allergy: '无',
          medicalHistory: '高血压',
          lastVisit: '2026-04-01',
        },
        summary: {
          totalDemands: 5,
          completedDemands: 3,
          pendingDemands: 2,
          totalTouchpoints: 10,
          lastFollowup: '2026-03-28',
        },
      };
      mockPatientSkillService.getPatientDetail.mockResolvedValue(mockResult);

      const mockReq = {
        aiKeyConfig: { orgId: 'test-org' }
      } as any;

      const result = await controller.getPatientDetail('1', mockReq) as any;

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('张三');
    });

    it('should return PATIENT_NOT_FOUND when patient does not exist', async () => {
      const error = new Error('NotFoundException');
      error.name = 'NotFoundException';
      mockPatientSkillService.getPatientDetail.mockRejectedValue(error);

      const mockReq = {
        aiKeyConfig: { orgId: 'test-org' }
      } as any;

      const result = await controller.getPatientDetail('non-existent', mockReq) as any;

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('PATIENT_NOT_FOUND');
    });
  });

  describe('createTouchpoint', () => {
    it('should create touchpoint', async () => {
      const mockResult = {
        id: 'tp-1',
        patientId: 'patient-1',
        type: 'VISIT',
        title: '术后回访',
        createdAt: '2026-04-08T12:00:00Z',
      };
      mockPatientSkillService.createTouchpoint.mockResolvedValue(mockResult);

      const mockReq = {
        aiKeyConfig: { orgId: 'test-org' }
      } as any;

      const dto = { type: 'VISIT', title: '术后回访', content: '患者反映良好' } as any;

      const result = await controller.createTouchpoint('patient-1', dto, mockReq) as any;

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('tp-1');
    });
  });

  describe('createFollowup', () => {
    it('should create followup', async () => {
      const mockResult = {
        id: 'fp-1',
        patientId: 'patient-1',
        type: 'POST_TREATMENT',
        title: '术后一周回访',
        status: 'ACTIVE',
        plannedAt: '2026-04-15T10:00:00Z',
      };
      mockPatientSkillService.createFollowup.mockResolvedValue(mockResult);

      const mockReq = {
        aiKeyConfig: { orgId: 'test-org' }
      } as any;

      const dto = {
        type: 'POST_TREATMENT',
        title: '术后一周回访',
        plannedAt: '2026-04-15T10:00:00Z'
      } as any;

      const result = await controller.createFollowup('patient-1', dto, mockReq) as any;

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('fp-1');
    });
  });
});