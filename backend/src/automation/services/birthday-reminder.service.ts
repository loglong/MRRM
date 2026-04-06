import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BirthdayReminderService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check and create birthday reminders for patients with birthdays in the next 7 days
   * Creates FollowupRecord with type ROUTINE for birthday follow-up
   */
  async checkAndCreateBirthdayReminders(orgId?: string): Promise<number> {
    const today = new Date();
    const targetDates = this.getTargetBirthdayDates(today, 7);

    // Build where clause for active patients with birthDate
    const whereClause: any = {
      status: 'ACTIVE',
      birthDate: { not: null },
    };
    if (orgId) {
      whereClause.orgId = orgId;
    }

    const patients = await this.prisma.patient.findMany({
      where: whereClause,
    });

    // Filter patients with upcoming birthdays
    const upcomingBirthdays = patients.filter(p => {
      if (!p.birthDate) return false;
      const birthDate = new Date(p.birthDate);
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      return targetDates.some(d =>
        d.getMonth() === thisYearBirthday.getMonth() &&
        d.getDate() === thisYearBirthday.getDate()
      );
    });

    // Create follow-up tasks for each upcoming birthday
    for (const patient of upcomingBirthdays) {
      await this.createBirthdayFollowup(patient, today);
    }

    return upcomingBirthdays.length;
  }

  /**
   * Create birthday follow-up record for a patient
   */
  private async createBirthdayFollowup(patient: any, today: Date) {
    // Check if birthday follow-up already exists for this year
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

    const existingFollowup = await this.prisma.followupRecord.findFirst({
      where: {
        patientId: patient.id,
        scheduledAt: { gte: yearStart, lte: yearEnd },
        notes: { contains: '生日随访' },
      },
    });

    if (existingFollowup) {
      return; // Already created for this year
    }

    // Create or find birthday follow-up plan
    let plan = await this.prisma.followupPlan.findFirst({
      where: {
        patientId: patient.id,
        name: '生日随访计划',
      },
    });

    if (!plan) {
      plan = await this.prisma.followupPlan.create({
        data: {
          patientId: patient.id,
          orgId: patient.orgId,
          name: '生日随访计划',
          type: 'ROUTINE',
          status: 'ACTIVE',
          frequencyDays: 365,
          startDate: today,
        },
      });
    }

    // Calculate birthday date this year
    const birthDate = new Date(patient.birthDate);
    const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

    // Create follow-up record
    await this.prisma.followupRecord.create({
      data: {
        planId: plan.id,
        patientId: patient.id,
        orgId: patient.orgId,
        scheduledAt: birthdayThisYear,
        status: 'PENDING',
        notes: `患者${patient.name}生日随访`,
      },
    });
  }

  /**
   * Get target dates for birthday check
   */
  private getTargetBirthdayDates(from: Date, days: number): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }
}
