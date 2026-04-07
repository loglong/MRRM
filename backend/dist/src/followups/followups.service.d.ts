import { PrismaService } from '../common/prisma/prisma.service';
import { CreateFollowupPlanDto } from './dto/create-followup-plan.dto';
import { ExecuteFollowupDto } from './dto/execute-followup.dto';
import { FollowupPlanFiltersDto, FollowupRecordFiltersDto } from './dto/followup-filters.dto';
export declare class FollowupsService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    createPlan(dto: CreateFollowupPlanDto, orgId: string, userId: string): Promise<{
        recordCount: number;
        completedCount: number;
        patient: {
            id: string;
            name: string;
        };
        assignedUser: {
            id: string;
            name: string;
        } | null;
        id: string;
        name: string;
        orgId: string;
        status: import(".prisma/client").$Enums.FollowupStatus;
        assignedUserId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        type: import(".prisma/client").$Enums.FollowupType;
        frequencyDays: number | null;
        startDate: Date;
        endDate: Date | null;
    }>;
    generateFollowupRecords(plan: {
        id: string;
        patientId: string;
        orgId: string;
        frequencyDays: number | null;
        startDate: Date;
        endDate: Date | null;
    }, pathInstanceStepId?: string): Promise<void>;
    findPlans(orgId: string, filters: FollowupPlanFiltersDto): Promise<{
        data: {
            recordCount: number;
            completedCount: number;
            patient: {
                id: string;
                name: string;
            };
            assignedUser: {
                id: string;
                name: string;
            } | null;
            _count: {
                records: number;
            };
            id: string;
            name: string;
            orgId: string;
            status: import(".prisma/client").$Enums.FollowupStatus;
            assignedUserId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            type: import(".prisma/client").$Enums.FollowupType;
            frequencyDays: number | null;
            startDate: Date;
            endDate: Date | null;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findPlanById(id: string, orgId: string): Promise<{
        patient: {
            id: string;
            name: string;
        };
        assignedUser: {
            id: string;
            name: string;
        } | null;
        records: {
            id: string;
            orgId: string;
            status: import(".prisma/client").$Enums.FollowupRecordStatus;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            outcome: string | null;
            planId: string;
            scheduledAt: Date;
            completedAt: Date | null;
            notes: string | null;
            completedById: string | null;
            pathInstanceStepId: string | null;
        }[];
    } & {
        id: string;
        name: string;
        orgId: string;
        status: import(".prisma/client").$Enums.FollowupStatus;
        assignedUserId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        type: import(".prisma/client").$Enums.FollowupType;
        frequencyDays: number | null;
        startDate: Date;
        endDate: Date | null;
    }>;
    findRecords(orgId: string, filters: FollowupRecordFiltersDto): Promise<{
        data: ({
            patient: {
                id: string;
                name: string;
            };
            plan: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            orgId: string;
            status: import(".prisma/client").$Enums.FollowupRecordStatus;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            outcome: string | null;
            planId: string;
            scheduledAt: Date;
            completedAt: Date | null;
            notes: string | null;
            completedById: string | null;
            pathInstanceStepId: string | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    executeRecord(recordId: string, dto: ExecuteFollowupDto, userId: string, orgId: string): Promise<{
        patient: {
            id: string;
            name: string;
        };
        plan: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        orgId: string;
        status: import(".prisma/client").$Enums.FollowupRecordStatus;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        outcome: string | null;
        planId: string;
        scheduledAt: Date;
        completedAt: Date | null;
        notes: string | null;
        completedById: string | null;
        pathInstanceStepId: string | null;
    }>;
    detectOverdueRecords(): Promise<{
        updated: number;
    }>;
    getCompletionRate(orgId: string, filters?: {
        startDate?: string;
        endDate?: string;
        patientId?: string;
    }): Promise<{
        total: number;
        completed: number;
        missed: number;
        pending: number;
        completionRate: number;
        byPlan: {
            planId: string;
            planName: string;
            rate: number;
        }[];
    }>;
    pausePlan(planId: string, orgId: string): Promise<{
        id: string;
        name: string;
        orgId: string;
        status: import(".prisma/client").$Enums.FollowupStatus;
        assignedUserId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        type: import(".prisma/client").$Enums.FollowupType;
        frequencyDays: number | null;
        startDate: Date;
        endDate: Date | null;
    }>;
    resumePlan(planId: string, orgId: string): Promise<{
        id: string;
        name: string;
        orgId: string;
        status: import(".prisma/client").$Enums.FollowupStatus;
        assignedUserId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        type: import(".prisma/client").$Enums.FollowupType;
        frequencyDays: number | null;
        startDate: Date;
        endDate: Date | null;
    }>;
}
