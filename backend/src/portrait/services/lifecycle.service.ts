import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LifecycleStage } from '@prisma/client';

@Injectable()
export class LifecycleService {
  constructor(private prisma: PrismaService) {}

  async checkAndAdvanceLifecycle(patientId: string): Promise<LifecycleStage | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        demands: { orderBy: { createdAt: 'desc' }, take: 1 },
        pathInstances: { where: { status: 'IN_PROGRESS' }, take: 1 }
      }
    });

    if (!patient) return null;

    const currentStage = patient.lifecycleStage;
    let newStage: LifecycleStage | null = null;

    // Check upgrade rules
    if (currentStage === 'DEVELOPMENT') {
      const hasTreatmentDemand = patient.demands.some(
        d => d.type === 'TREATMENT' && ['IN_PROGRESS', 'FULFILLED'].includes(d.status)
      );
      if (hasTreatmentDemand) newStage = 'PRE_TREATMENT';
    }

    if (currentStage === 'PRE_TREATMENT') {
      const hasActivePath = patient.pathInstances.length > 0;
      if (hasActivePath && patient.preTreatmentStartDate) newStage = 'TREATMENT';
    }

    if (currentStage === 'TREATMENT') {
      if (patient.treatmentEndDate) {
        const daysSinceEnd = (Date.now() - patient.treatmentEndDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceEnd >= 90) newStage = 'MAINTENANCE';
      }
    }

    // Check downgrade rules
    if (newStage === null && currentStage !== 'DEVELOPMENT') {
      const lastContactDays = patient.lastContactAt
        ? (Date.now() - patient.lastContactAt.getTime()) / (1000 * 60 * 60 * 24)
        : 999;

      if (lastContactDays > 60) {
        const cancelledDemand = patient.demands.some(d => ['CANCELLED', 'LOST'].includes(d.status));
        if (cancelledDemand) newStage = 'DEVELOPMENT';
      }
    }

    if (newStage && newStage !== currentStage) {
      await this.prisma.patient.update({
        where: { id: patientId },
        data: { lifecycleStage: newStage, stageEnteredAt: new Date(), stageUpdatedAt: new Date() }
      });
      return newStage;
    }

    return null;
  }

  async getLifecycleStage(patientId: string): Promise<LifecycleStage> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { lifecycleStage: true }
    });
    return patient?.lifecycleStage || 'DEVELOPMENT';
  }
}