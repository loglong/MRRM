import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { Logger } from '../common/logger';
import { CreatePatientDtoType } from './dto/create-patient.dto';
import { UpdatePatientDtoType } from './dto/update-patient.dto';
import { PatientProfileResponseDto } from './dto/patient-profile.dto';
import { TaggingService } from '../portrait/services/tagging.service';
import { AiTaggingService } from '../portrait/services/ai-tagging.service';
import { MiniMaxProvider } from '../ai/services/llm.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PatientsService {
  private logger = new Logger('PatientsService');

  // Fields that should be encrypted
  private readonly encryptedFields = ['allergyHistory', 'pastHistory'];

  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  async create(data: CreatePatientDtoType, orgId: string): Promise<any> {
    // Encrypt sensitive medical fields
    const encryptedData = this.encryptSensitiveFields(data);

    const patient = await this.prisma.patient.create({
      data: {
        ...encryptedData,
        orgId,
        tier: data.tier || 'REGULAR',
      },
    });

    this.logger.log(`Patient created: ${patient.id} (${patient.name})`, 'PatientsService');
    return this.decryptSensitiveFields(patient);
  }

  async findAll(
    orgId: string,
    page = 1,
    limit = 20,
    filters?: { tier?: string; search?: string },
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const where: any = { orgId, deletedAt: null };

    if (filters?.tier) {
      where.tier = filters.tier;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ];
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count({ where }),
    ]);

    // Decrypt medical fields for response
    const decryptedPatients = patients.map((p) => this.decryptSensitiveFields(p));

    return {
      data: decryptedPatients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<any> {
    const patient = await this.prisma.patient.findUnique({
      where: { id, deletedAt: null },
      include: {
        demands: { take: 10, orderBy: { createdAt: 'desc' } },
        touchpoints: { take: 10, orderBy: { createdAt: 'desc' } },
        followupPlans: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.decryptSensitiveFields(patient);
  }

  async update(id: string, data: UpdatePatientDtoType): Promise<any> {
    // Check patient exists
    await this.findById(id);

    // Encrypt sensitive fields if they are being updated
    const encryptedData = this.encryptSensitiveFields(data);

    const patient = await this.prisma.patient.update({
      where: { id },
      data: encryptedData,
    });

    this.logger.log(`Patient updated: ${patient.id}`, 'PatientsService');
    return this.decryptSensitiveFields(patient);
  }

  async delete(id: string): Promise<any> {
    // Check patient exists
    await this.findById(id);

    // Soft delete
    const patient = await this.prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Patient soft-deleted: ${patient.id}`, 'PatientsService');
    return patient;
  }

  async search(orgId: string, query: string, field: 'name' | 'phone' | 'all' = 'all'): Promise<any[]> {
    const where: any = { orgId, deletedAt: null };

    if (field === 'name') {
      where.name = { contains: query, mode: 'insensitive' };
    } else if (field === 'phone') {
      where.phone = { contains: query };
    } else {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
      ];
    }

    const patients = await this.prisma.patient.findMany({
      where,
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return patients.map((p) => this.decryptSensitiveFields(p));
  }

  async getStats(orgId: string): Promise<any> {
    const [total, byTier, byGender] = await Promise.all([
      this.prisma.patient.count({ where: { orgId, deletedAt: null } }),
      this.prisma.patient.groupBy({
        by: ['tier'],
        where: { orgId, deletedAt: null },
        _count: true,
      }),
      this.prisma.patient.groupBy({
        by: ['gender'],
        where: { orgId, deletedAt: null },
        _count: true,
      }),
    ]);

    const byTierMap: any = { HIGH_VALUE: 0, REGULAR: 0, LOST_RISK: 0 };
    byTier.forEach((t) => {
      byTierMap[t.tier] = t._count;
    });

    const byGenderMap: any = {};
    byGender.forEach((g) => {
      byGenderMap[g.gender || 'UNKNOWN'] = g._count;
    });

    return {
      total,
      byTier: byTierMap,
      byGender: byGenderMap,
    };
  }

  async getPatientPortrait(patientId: string): Promise<PatientProfileResponseDto> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { patientTags: { where: { status: 'ACTIVE' } } },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    return {
      id: patient.id,
      name: patient.name,
      phone: patient.phone || '',
      lifecycle: {
        stage: patient.lifecycleStage,
        enteredAt: patient.stageEnteredAt,
        updatedAt: patient.stageUpdatedAt || null,
      },
      rfm: {
        lastOrderAt: patient.lastOrderAt,
        orderCount: patient.orderCount,
        totalAmount: Number(patient.totalAmount),
        avgAmount: Number(patient.avgAmount),
      },
      stats: {
        totalVisits: patient.totalVisits,
        lastContactAt: patient.lastContactAt,
        touchpointCount: patient.touchpointCount,
        avgSatisfaction: patient.avgSatisfaction ? Number(patient.avgSatisfaction) : null,
      },
      scores: {
        churnRisk: Number(patient.churnRiskScore),
        engagement: Number(patient.engagementScore),
        value: Number(patient.valueScore),
      },
      tags: patient.patientTags.map((t) => ({
        code: t.tagCode,
        name: t.tagName,
        category: t.category,
        source: t.source,
        confidence: t.confidence ? Number(t.confidence) : null,
        status: t.status,
      })),
      aiRecommendation: patient.aiRecommendation,
    };
  }

  async getPatientTags(patientId: string, category?: string, status?: string) {
    const where: any = { patientId };
    if (category) where.category = category;
    if (status) where.status = status;
    return this.prisma.patientTag.findMany({ where });
  }

  async addManualTag(patientId: string, tagCode: string, tagName: string, category: string) {
    const taggingService = new TaggingService(this.prisma);
    return taggingService.addManualTag(patientId, tagCode, tagName, category as any);
  }

  async updateTagStatus(tagId: string, status: string) {
    return this.prisma.patientTag.update({
      where: { id: tagId },
      data: { status: status as any },
    });
  }

  async triggerAiAnalysis(patientId: string) {
    const minimaxProvider = new MiniMaxProvider(new ConfigService());
    const aiTaggingService = new AiTaggingService(this.prisma, minimaxProvider);
    return aiTaggingService.analyzePatient(patientId);
  }

  private encryptSensitiveFields(data: any): any {
    if (!data) return data;

    const result = { ...data };
    for (const field of this.encryptedFields) {
      if (result[field]) {
        result[field] = this.encryption.encrypt(result[field]);
      }
    }
    return result;
  }

  private decryptSensitiveFields(data: any): any {
    if (!data) return data;

    const result = { ...data };
    for (const field of this.encryptedFields) {
      if (result[field]) {
        result[field] = this.encryption.decrypt(result[field]);
      }
    }
    return result;
  }
}
