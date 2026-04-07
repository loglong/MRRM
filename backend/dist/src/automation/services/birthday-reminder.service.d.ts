import { PrismaService } from '../../common/prisma/prisma.service';
export declare class BirthdayReminderService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkAndCreateBirthdayReminders(orgId?: string): Promise<number>;
    private createBirthdayFollowup;
    private getTargetBirthdayDates;
}
