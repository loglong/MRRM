import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface FollowupCycle {
  type: string;
  days: number;
}

@Injectable()
export class FollowupReminderService {
  // Treatment type to follow-up cycle mapping (in days)
  private readonly FOLLOWUP_CYCLES: Record<string, number> = {
    implant: 180,         // Dental implant: 6 months
    orthodontics: 30,      // Orthodontics: 1 month
    whitening: 14,        // Teeth whitening: 2 weeks
    restoration: 30,      // Restoration: 1 month
    periodontal: 90,      // Periodontal treatment: 3 months
    extraction: 7,         // Tooth extraction: 1 week
    pediatric: 90,        // Pediatric dentistry: 3 months
    checkup: 180,          // Regular checkup: 6 months
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check and create follow-up reminders for patients with treatment cycle ending
   * Creates FollowupRecord with type POST_TREATMENT for return visits
   */
  async checkAndCreateFollowupReminders(orgId?: string): Promise<number> {
    // Get demands completed in the last 2 years (to catch all relevant cycles)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const whereClause: any = {
      status: 'FULFILLED',
      treatmentEndDate: { gte: twoYearsAgo },
    };
    if (orgId) {
      whereClause.orgId = orgId;
    }

    const completedDemands = await this.prisma.demand.findMany({
      where: whereClause,
      include: {
        patient: {
          select: { id: true, name: true, orgId: true, assignedUserId: true },
        },
      },
    });

    let remindersCreated = 0;

    for (const demand of completedDemands) {
      if (!demand.treatmentEndDate) continue;

      const cycleDays = this.FOLLOWUP_CYCLES[demand.type.toLowerCase()] || 90;
      const followupDate = this.calculateFollowupDate(new Date(demand.treatmentEndDate), cycleDays);

      // If follow-up date is within the next 7 days, create reminder
      if (this.isWithinReminderWindow(followupDate, 7)) {
        const created = await this.createFollowupReminder(demand, followupDate);
        if (created) remindersCreated++;
      }
    }

    return remindersCreated;
  }

  /**
   * Calculate follow-up date based on treatment end date and cycle days
   */
  private calculateFollowupDate(endTime: Date, cycleDays: number): Date {
    const date = new Date(endTime);
    date.setDate(date.getDate() + cycleDays);
    return date;
  }

  /**
   * Check if target date is within reminder window (today to windowDays ahead)
   */
  private isWithinReminderWindow(targetDate: Date, windowDays: number): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + windowDays);

    return targetDate >= today && targetDate <= maxDate;
  }

  /**
   * Create follow-up reminder for a demand
   */
  private async createFollowupReminder(demand: any, followupDate: Date): Promise<boolean> {
    // Check if reminder already exists for this demand around this date
    const dayBefore = new Date(followupDate);
    dayBefore.setDate(dayBefore.getDate() - 1);

    const dayAfter = new Date(followupDate);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const existing = await this.prisma.followupRecord.findFirst({
      where: {
        patientId: demand.patientId,
        scheduledAt: { gte: dayBefore, lte: dayAfter },
        notes: { contains: demand.type },
      },
    });

    if (existing) {
      return false; // Already exists
    }

    // Create follow-up record
    await this.prisma.followupRecord.create({
      data: {
        patientId: demand.patientId,
        orgId: demand.patient.orgId,
        scheduledAt: followupDate,
        status: 'PENDING',
        notes: `${demand.type}复诊提醒`,
      },
    });

    return true;
  }
}
