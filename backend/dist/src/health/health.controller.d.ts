import { HealthService, HealthArchive, TimelineResult } from './health.service';
import { CreateHealthRecordDtoType } from './dto/health-archive.dto';
import { CreateHealthReminderDtoType } from './dto/health-reminder.dto';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealthArchive(patientId: string, req: any): Promise<HealthArchive>;
    getHealthTimeline(patientId: string, cursor?: string, limit?: string, req?: any): Promise<TimelineResult>;
    createHealthRecord(patientId: string, createDto: CreateHealthRecordDtoType, req: any): Promise<import("./health.service").HealthRecordResponse>;
    getReminders(patientId: string, req: any): Promise<import("./health.service").HealthReminderResponse[]>;
    createReminder(createDto: CreateHealthReminderDtoType, req: any): Promise<import("./health.service").HealthReminderResponse>;
    completeReminder(id: string, req: any): Promise<import("./health.service").HealthReminderResponse>;
    deleteReminder(id: string, req: any): Promise<void>;
}
