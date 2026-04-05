import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';
import { JourneyEvent, JourneyEventType, JourneyResponse } from './entities/journey-event.entity';

@Injectable()
export class JourneyService {
  private logger = new Logger('JourneyService');

  constructor(private prisma: PrismaService) {}

  async getPatientJourney(
    patientId: string,
    orgId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<JourneyResponse> {
    // Verify patient exists and belongs to org
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, orgId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Fetch all events in PARALLEL using Promise.all
    const [touchpoints, demands, pathInstances, followupRecords, journeyMilestones] = await Promise.all([
      // Touchpoints: exclude voided records
      this.prisma.touchpoint.findMany({
        where: { patientId, orgId, voidedAt: null },
        select: {
          id: true,
          type: true,
          channel: true,
          title: true,
          sentiment: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      // Demands
      this.prisma.demand.findMany({
        where: { patientId, orgId },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      // Path Instances with steps
      this.prisma.pathInstance.findMany({
        where: { patientId, orgId },
        include: {
          path: { select: { id: true, name: true } },
          steps: {
            orderBy: { stepOrder: 'asc' },
            select: {
              id: true,
              stepOrder: true,
              status: true,
              dueDate: true,
              completedAt: true,
              step: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { startedAt: 'asc' },
      }),
      // Followup Records
      this.prisma.followupRecord.findMany({
        where: { patientId, orgId },
        select: {
          id: true,
          status: true,
          scheduledAt: true,
          completedAt: true,
          plan: { select: { id: true, name: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      // Journey Milestones
      this.prisma.journeyMilestone.findMany({
        where: { patientId, orgId },
        select: {
          id: true,
          milestone: true,
          category: true,
          description: true,
          occurredAt: true,
        },
        orderBy: { occurredAt: 'asc' },
      }),
    ]);

    // Transform each source into JourneyEvent array
    const events: JourneyEvent[] = [];

    // Touchpoints -> TOUCHPOINT events
    touchpoints.forEach((tp) => {
      events.push({
        id: tp.id,
        type: 'TOUCHPOINT' as JourneyEventType,
        title: tp.title,
        subType: tp.channel,
        sentiment: tp.sentiment || undefined,
        status: tp.type,
        occurredAt: tp.createdAt,
        metadata: { channel: tp.channel },
      });
    });

    // Demands -> DEMAND events
    demands.forEach((d) => {
      events.push({
        id: d.id,
        type: 'DEMAND' as JourneyEventType,
        title: d.title,
        subType: d.type,
        status: d.status,
        occurredAt: d.createdAt,
        metadata: { demandType: d.type },
      });
    });

    // Path Instances -> PATH_START, PATH_STEP, PATH_END events
    pathInstances.forEach((pi) => {
      // PATH_START event
      events.push({
        id: `${pi.id}-start`,
        type: 'PATH_START' as JourneyEventType,
        title: `Started path: ${pi.path.name}`,
        subType: pi.path.name,
        status: pi.status,
        occurredAt: pi.startedAt,
        metadata: { pathId: pi.path.id, pathInstanceId: pi.id },
      });

      // PATH_STEP events for each step
      pi.steps.forEach((step) => {
        events.push({
          id: step.id,
          type: 'PATH_STEP' as JourneyEventType,
          title: step.step.name,
          subType: `Step ${step.stepOrder}`,
          status: step.status,
          occurredAt: step.completedAt || step.dueDate,
          metadata: {
            stepId: step.step.id,
            stepOrder: step.stepOrder,
            pathInstanceId: pi.id,
          },
        });
      });

      // PATH_END event if completed
      if (pi.completedAt) {
        events.push({
          id: `${pi.id}-end`,
          type: 'PATH_END' as JourneyEventType,
          title: `Completed path: ${pi.path.name}`,
          subType: pi.path.name,
          status: pi.status,
          occurredAt: pi.completedAt,
          metadata: { pathId: pi.path.id, pathInstanceId: pi.id },
        });
      }
    });

    // Followup Records -> FOLLOWUP events
    followupRecords.forEach((fr) => {
      events.push({
        id: fr.id,
        type: 'FOLLOWUP' as JourneyEventType,
        title: fr.plan.name,
        subType: fr.status,
        status: fr.status,
        occurredAt: fr.completedAt || fr.scheduledAt,
        metadata: { planId: fr.plan.id },
      });
    });

    // Journey Milestones -> MILESTONE events
    journeyMilestones.forEach((jm) => {
      events.push({
        id: jm.id,
        type: 'MILESTONE' as JourneyEventType,
        title: jm.milestone,
        subType: jm.category,
        status: jm.category,
        occurredAt: jm.occurredAt,
        metadata: { description: jm.description },
      });
    });

    // Sort all events by occurredAt ascending (chronological order)
    events.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

    // Apply pagination
    const total = events.length;
    const skip = (page - 1) * limit;
    const paginatedEvents = events.slice(skip, skip + limit);

    this.logger.log(
      `Retrieved ${total} events for patient ${patientId} (page ${page}, limit ${limit})`,
      'JourneyService',
    );

    return {
      events: paginatedEvents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
