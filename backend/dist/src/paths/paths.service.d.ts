import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePathDtoType } from './dto/create-path.dto';
import { UpdatePathDtoType } from './dto/update-path.dto';
import { CreatePathStepDtoType } from './dto/create-path-step.dto';
import { AssignPathDtoType } from './dto/assign-path.dto';
import { CompleteStepDtoType, SkipStepDtoType } from './dto/complete-step.dto';
export declare class PathsService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    create(data: CreatePathDtoType, orgId: string): Promise<{
        id: string;
        name: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        version: string;
        icd10Code: string | null;
        icd9Code: string | null;
        diagnosisName: string | null;
        surgeryName: string | null;
    }>;
    findAll(orgId: string, page?: number, limit?: number, filters?: {
        status?: string;
        search?: string;
    }): Promise<{
        data: {
            stepCount: number;
            _count: undefined;
            id: string;
            name: string;
            orgId: string;
            status: import(".prisma/client").$Enums.PathStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            version: string;
            icd10Code: string | null;
            icd9Code: string | null;
            diagnosisName: string | null;
            surgeryName: string | null;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
        steps: {
            id: string;
            name: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            pathId: string;
            stepOrder: number;
            stepType: import(".prisma/client").$Enums.StepType;
            estimatedDays: number | null;
            timeoutHours: number | null;
            triggerAction: string | null;
            notificationTemplate: string | null;
        }[];
    } & {
        id: string;
        name: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        version: string;
        icd10Code: string | null;
        icd9Code: string | null;
        diagnosisName: string | null;
        surgeryName: string | null;
    }>;
    update(id: string, data: UpdatePathDtoType): Promise<{
        id: string;
        name: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        version: string;
        icd10Code: string | null;
        icd9Code: string | null;
        diagnosisName: string | null;
        surgeryName: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        version: string;
        icd10Code: string | null;
        icd9Code: string | null;
        diagnosisName: string | null;
        surgeryName: string | null;
    }>;
    duplicate(id: string, orgId: string): Promise<{
        steps: {
            id: string;
            name: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            pathId: string;
            stepOrder: number;
            stepType: import(".prisma/client").$Enums.StepType;
            estimatedDays: number | null;
            timeoutHours: number | null;
            triggerAction: string | null;
            notificationTemplate: string | null;
        }[];
    } & {
        id: string;
        name: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        version: string;
        icd10Code: string | null;
        icd9Code: string | null;
        diagnosisName: string | null;
        surgeryName: string | null;
    }>;
    addStep(pathId: string, data: CreatePathStepDtoType): Promise<{
        id: string;
        name: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        pathId: string;
        stepOrder: number;
        stepType: import(".prisma/client").$Enums.StepType;
        estimatedDays: number | null;
        timeoutHours: number | null;
        triggerAction: string | null;
        notificationTemplate: string | null;
    }>;
    updateStep(pathId: string, stepId: string, data: Partial<CreatePathStepDtoType>): Promise<{
        id: string;
        name: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        pathId: string;
        stepOrder: number;
        stepType: import(".prisma/client").$Enums.StepType;
        estimatedDays: number | null;
        timeoutHours: number | null;
        triggerAction: string | null;
        notificationTemplate: string | null;
    }>;
    deleteStep(pathId: string, stepId: string): Promise<{
        id: string;
        name: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        pathId: string;
        stepOrder: number;
        stepType: import(".prisma/client").$Enums.StepType;
        estimatedDays: number | null;
        timeoutHours: number | null;
        triggerAction: string | null;
        notificationTemplate: string | null;
    }>;
    assignToPatient(pathId: string, data: AssignPathDtoType, orgId: string): Promise<{
        steps: {
            id: string;
            status: import(".prisma/client").$Enums.PathStepInstanceStatus;
            completedAt: Date | null;
            notes: string | null;
            instanceId: string;
            stepId: string;
            stepOrder: number;
            dueDate: Date;
        }[];
    } & {
        id: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathInstanceStatus;
        patientId: string;
        pathId: string;
        completedAt: Date | null;
        demandId: string;
        currentStep: number;
        startedAt: Date;
    }>;
    getInstance(id: string): Promise<{
        patient: {
            id: string;
            name: string;
        };
        path: {
            id: string;
            name: string;
            orgId: string;
            status: import(".prisma/client").$Enums.PathStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            version: string;
            icd10Code: string | null;
            icd9Code: string | null;
            diagnosisName: string | null;
            surgeryName: string | null;
        };
        steps: {
            id: string;
            status: import(".prisma/client").$Enums.PathStepInstanceStatus;
            completedAt: Date | null;
            notes: string | null;
            instanceId: string;
            stepId: string;
            stepOrder: number;
            dueDate: Date;
        }[];
    } & {
        id: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathInstanceStatus;
        patientId: string;
        pathId: string;
        completedAt: Date | null;
        demandId: string;
        currentStep: number;
        startedAt: Date;
    }>;
    getPatientInstances(patientId: string): Promise<({
        path: {
            id: string;
            name: string;
        };
        steps: {
            id: string;
            status: import(".prisma/client").$Enums.PathStepInstanceStatus;
            completedAt: Date | null;
            notes: string | null;
            instanceId: string;
            stepId: string;
            stepOrder: number;
            dueDate: Date;
        }[];
    } & {
        id: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathInstanceStatus;
        patientId: string;
        pathId: string;
        completedAt: Date | null;
        demandId: string;
        currentStep: number;
        startedAt: Date;
    })[]>;
    getDemandInstances(demandId: string): Promise<({
        path: {
            id: string;
            name: string;
        };
        steps: {
            id: string;
            status: import(".prisma/client").$Enums.PathStepInstanceStatus;
            completedAt: Date | null;
            notes: string | null;
            instanceId: string;
            stepId: string;
            stepOrder: number;
            dueDate: Date;
        }[];
    } & {
        id: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathInstanceStatus;
        patientId: string;
        pathId: string;
        completedAt: Date | null;
        demandId: string;
        currentStep: number;
        startedAt: Date;
    })[]>;
    getInstances(orgId: string, page?: number, limit?: number, filters?: {
        patientId?: string;
        demandId?: string;
        status?: string;
    }): Promise<{
        data: ({
            patient: {
                id: string;
                name: string;
            };
            path: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            orgId: string;
            status: import(".prisma/client").$Enums.PathInstanceStatus;
            patientId: string;
            pathId: string;
            completedAt: Date | null;
            demandId: string;
            currentStep: number;
            startedAt: Date;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    completeStep(instanceId: string, stepId: string, data: CompleteStepDtoType): Promise<{
        patient: {
            id: string;
            name: string;
        };
        path: {
            id: string;
            name: string;
            orgId: string;
            status: import(".prisma/client").$Enums.PathStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            version: string;
            icd10Code: string | null;
            icd9Code: string | null;
            diagnosisName: string | null;
            surgeryName: string | null;
        };
        steps: {
            id: string;
            status: import(".prisma/client").$Enums.PathStepInstanceStatus;
            completedAt: Date | null;
            notes: string | null;
            instanceId: string;
            stepId: string;
            stepOrder: number;
            dueDate: Date;
        }[];
    } & {
        id: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathInstanceStatus;
        patientId: string;
        pathId: string;
        completedAt: Date | null;
        demandId: string;
        currentStep: number;
        startedAt: Date;
    }>;
    skipStep(instanceId: string, stepId: string, data: SkipStepDtoType): Promise<{
        patient: {
            id: string;
            name: string;
        };
        path: {
            id: string;
            name: string;
            orgId: string;
            status: import(".prisma/client").$Enums.PathStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            version: string;
            icd10Code: string | null;
            icd9Code: string | null;
            diagnosisName: string | null;
            surgeryName: string | null;
        };
        steps: {
            id: string;
            status: import(".prisma/client").$Enums.PathStepInstanceStatus;
            completedAt: Date | null;
            notes: string | null;
            instanceId: string;
            stepId: string;
            stepOrder: number;
            dueDate: Date;
        }[];
    } & {
        id: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathInstanceStatus;
        patientId: string;
        pathId: string;
        completedAt: Date | null;
        demandId: string;
        currentStep: number;
        startedAt: Date;
    }>;
    cancelInstance(id: string): Promise<{
        id: string;
        orgId: string;
        status: import(".prisma/client").$Enums.PathInstanceStatus;
        patientId: string;
        pathId: string;
        completedAt: Date | null;
        demandId: string;
        currentStep: number;
        startedAt: Date;
    }>;
    detectOverdueSteps(): Promise<{
        updated: number;
    }>;
}
