import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { Logger } from '../common/logger';
import { CreatePatientDtoType } from './dto/create-patient.dto';
import { UpdatePatientDtoType } from './dto/update-patient.dto';

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
