import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from '@prisma/client';
import { Patient, Demand, Touchpoint, FollowupRecord, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  MobilePatientListDto,
  MobileDemandListDto,
  MobilePatientDto,
  MobileDemandDto,
  MobileTouchpointDto,
  MobileFollowupDto,
} from './dto/mobile-patient.dto';

@Injectable()
export class MobileService {
  constructor(private readonly prisma: PrismaService) {}

  async getPatients(dto: MobilePatientListDto, orgId: string) {
    const { page = 1, pageSize = 20, search } = dto;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PatientWhereInput = {
      orgId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [patients, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedUser: {
            select: { name: true },
          },
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    const data: MobilePatientDto[] = patients.map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      gender: p.gender || null,
      tier: p.tier,
      status: p.status,
      lastVisitAt: p.lastVisitAt ? p.lastVisitAt.toISOString() : null,
      assignedUserName: p.assignedUser?.name || null,
    }));

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getDemands(dto: MobileDemandListDto, orgId: string) {
    const { page = 1, pageSize = 20, status } = dto;
    const skip = (page - 1) * pageSize;

    const where: Prisma.DemandWhereInput = {
      orgId,
    };

    if (status) {
      where.status = status as any;
    }

    const [demands, total] = await this.prisma.$transaction([
      this.prisma.demand.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { name: true },
          },
        },
      }),
      this.prisma.demand.count({ where }),
    ]);

    const data: MobileDemandDto[] = demands.map((d) => ({
      id: d.id,
      patientId: d.patientId,
      patientName: d.patient.name,
      type: d.type,
      title: d.title,
      status: d.status,
      priority: d.priority,
      createdAt: d.createdAt.toISOString(),
    }));

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getRecentTouchpoints(orgId: string, limit: number = 10) {
    const touchpoints = await this.prisma.touchpoint.findMany({
      where: {
        orgId,
        voidedAt: null,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: { name: true },
        },
      },
    });

    const data: MobileTouchpointDto[] = touchpoints.map((t) => ({
      id: t.id,
      patientId: t.patientId,
      patientName: t.patient.name,
      type: t.type,
      title: t.title,
      content: t.content,
      sentiment: t.sentiment || null,
      createdAt: t.createdAt.toISOString(),
    }));

    return { data };
  }

  async getPendingFollowups(orgId: string, limit: number = 20) {
    const followups = await this.prisma.followupRecord.findMany({
      where: {
        orgId,
        status: 'PENDING',
      },
      take: limit,
      orderBy: { scheduledAt: 'asc' },
      include: {
        patient: {
          select: { name: true },
        },
      },
    });

    const data: MobileFollowupDto[] = followups.map((f) => ({
      id: f.id,
      patientId: f.patientId,
      patientName: f.patient.name,
      type: f.type,
      status: f.status,
      planTime: f.scheduledAt.toISOString(),
      content: f.outcome || null,
    }));

    return { data };
  }
}
