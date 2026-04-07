import { PrismaService } from '../../common/prisma/prisma.service';
export declare class FollowupReminderService {
    private readonly prisma;
    private readonly FOLLOWUP_CYCLES;
    constructor(prisma: PrismaService);
    checkAndCreateFollowupReminders(orgId?: string): Promise<number>;
    private calculateFollowupDate;
    private isWithinReminderWindow;
    private createFollowupReminder;
}
