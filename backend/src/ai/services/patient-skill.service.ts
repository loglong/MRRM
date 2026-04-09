import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PatientSearchDto } from '../dto/patient-search.dto';
import { CreateTouchpointDto } from '../dto/create-touchpoint.dto';
import { CreateFollowupDto } from '../dto/create-followup.dto';

@Injectable()
export class PatientSkillService {
  constructor(private prisma: PrismaService) {}

  // 手机号脱敏
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  // 患者搜索
  async searchPatients(orgId: string, dto: PatientSearchDto) {
    const { q, tier, page = 1, limit = 20 } = dto;

    const where: any = {
      orgId,
      deletedAt: null,
    };

    if (tier) {
      where.tier = tier;
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          tier: true,
          lastVisitAt: true,
          tags: true,
          _count: {
            select: {
              demands: { where: { status: { in: ['OPEN', 'IN_PROGRESS', 'PENDING'] } } },
            },
          },
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      patients: patients.map((p) => ({
        id: p.id,
        name: p.name,
        phone: this.maskPhone(p.phone || ''),
        tier: p.tier,
        lastVisit: p.lastVisitAt?.toISOString().split('T')[0],
        pendingDemands: p._count.demands,
        tags: p.tags,
      })),
      pagination: {
        total,
        page,
        limit,
      },
    };
  }

  // 患者详情
  async getPatientDetail(orgId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, orgId, deletedAt: null },
      include: {
        _count: {
          select: {
            demands: true,
            touchpoints: true,
            followupPlans: true,
          },
        },
        demands: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS', 'PENDING'] } },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        touchpoints: {
          where: { voidedAt: null },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        followupPlans: {
          where: { status: { in: ['ACTIVE'] } },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      id: patient.id,
      name: patient.name,
      gender: patient.gender,
      age: patient.birthDate
        ? Math.floor((Date.now() - patient.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
      phone: this.maskPhone(patient.phone || ''),
      tier: patient.tier,
      medicalInfo: {
        allergy: patient.allergyHistory,
        medicalHistory: patient.pastHistory,
        lastVisit: patient.lastVisitAt?.toISOString().split('T')[0],
      },
      summary: {
        totalDemands: patient._count.demands,
        completedDemands: patient.demands.filter((d) => d.status === 'FULFILLED').length,
        pendingDemands: patient.demands.filter((d) => ['OPEN', 'IN_PROGRESS', 'PENDING'].includes(d.status)).length,
        totalTouchpoints: patient._count.touchpoints,
        lastFollowup: patient.followupPlans[0]?.startDate?.toISOString().split('T')[0],
      },
    };
  }

  // 创建触点
  async createTouchpoint(orgId: string, patientId: string, dto: CreateTouchpointDto) {
    // 验证患者存在
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, orgId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const touchpoint = await this.prisma.touchpoint.create({
      data: {
        patientId,
        orgId,
        type: dto.type,
        channel: dto.channel || 'OFFLINE',
        title: dto.title,
        content: dto.content,
      },
    });

    return {
      id: touchpoint.id,
      patientId: touchpoint.patientId,
      type: touchpoint.type,
      title: touchpoint.title,
      createdAt: touchpoint.createdAt.toISOString(),
    };
  }

  // 创建随访
  async createFollowup(orgId: string, patientId: string, dto: CreateFollowupDto) {
    // 验证患者存在
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, orgId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // 创建随访计划和首次记录
    const followupPlan = await this.prisma.followupPlan.create({
      data: {
        patientId,
        orgId,
        type: dto.type,
        name: dto.title,
        status: 'ACTIVE',
        startDate: new Date(dto.plannedAt),
        followupRecords: {
          create: {
            status: 'PENDING',
            scheduledAt: new Date(dto.plannedAt),
          },
        },
      },
    });

    return {
      id: followupPlan.id,
      patientId: followupPlan.patientId,
      type: followupPlan.type,
      name: followupPlan.name,
      status: followupPlan.status,
      plannedAt: followupPlan.startDate.toISOString(),
    };
  }
}
