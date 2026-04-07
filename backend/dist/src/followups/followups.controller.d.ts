import { FollowupsService } from './followups.service';
export declare class FollowupsController {
    private readonly followupsService;
    constructor(followupsService: FollowupsService);
    createPlan(body: any, req: any): Promise<{
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
    findPlans(query: any, req: any): Promise<{
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
    findPlanById(id: string, req: any): Promise<{
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
    pausePlan(id: string, req: any): Promise<{
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
    resumePlan(id: string, req: any): Promise<{
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
    createRecord(body: any, req: any): Promise<void>;
    findRecords(query: any, req: any): Promise<{
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
    executeRecord(id: string, body: any, req: any): Promise<{
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
    getCompletionRate(query: any, req: any): Promise<{
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
}
