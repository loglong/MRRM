import { PrismaService } from '../common/prisma/prisma.service';
import { CreateHealthRecordDtoType } from './dto/health-archive.dto';
import { CreateHealthReminderDtoType } from './dto/health-reminder.dto';
export interface HealthRecordResponse {
    id: string;
    patientId: string;
    orgId: string;
    category: 'ALLERGY' | 'PAST_HISTORY' | 'EXAM_RESULT' | 'DIAGNOSIS' | 'TREATMENT';
    title: string;
    description: string | null;
    recordDate: string;
    data: Record<string, any> | null;
    source: string;
    createdAt: string;
}
export interface HealthReminderResponse {
    id: string;
    patientId: string;
    orgId: string;
    type: 'REVIEW' | 'MEDICATION';
    title: string;
    content: string | null;
    remindAt: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
}
export interface HealthArchive {
    allergies: HealthRecordResponse[];
    pastHistory: HealthRecordResponse[];
    examResults: HealthRecordResponse[];
}
export interface TimelineResult {
    data: HealthRecordResponse[];
    nextCursor?: string;
}
export declare class HealthService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    private formatHealthRecord;
    private formatHealthReminder;
    getHealthArchive(orgId: string, patientId: string): Promise<HealthArchive>;
    getHealthTimeline(orgId: string, patientId: string, cursor?: string, limit?: number): Promise<TimelineResult>;
    createHealthRecord(orgId: string, patientId: string, data: CreateHealthRecordDtoType): Promise<HealthRecordResponse>;
    getReminders(orgId: string, patientId: string): Promise<HealthReminderResponse[]>;
    createReminder(orgId: string, data: CreateHealthReminderDtoType): Promise<HealthReminderResponse>;
    completeReminder(id: string, orgId: string): Promise<HealthReminderResponse>;
    deleteReminder(id: string, orgId: string): Promise<void>;
}
