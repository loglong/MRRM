import { PrismaService } from '../common/prisma/prisma.service';
import { PatientQueryDto, PatientResponseDto, DemandQueryDto, TouchpointQueryDto, HealthRecordQueryDto } from './dto/openapi-payload.dto';
export declare class IntegrationController {
    private prisma;
    constructor(prisma: PrismaService);
    private extractOrgId;
    listPatients(query: PatientQueryDto, headers: any): Promise<{
        data: {
            id: string;
            name: string;
            phone: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            tier: import(".prisma/client").$Enums.PatientTier;
            lastVisitAt: Date | null;
            createdAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPatient(id: string, headers: any): Promise<PatientResponseDto>;
    listDemands(query: DemandQueryDto, headers: any): Promise<{
        data: {
            id: string;
            status: import(".prisma/client").$Enums.DemandStatus;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            type: import(".prisma/client").$Enums.DemandType;
            title: string;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    listTouchpoints(query: TouchpointQueryDto, headers: any): Promise<{
        data: {
            id: string;
            createdAt: Date;
            patientId: string;
            type: import(".prisma/client").$Enums.TouchpointType;
            title: string;
            channel: import(".prisma/client").$Enums.TouchpointChannel;
            sentiment: import(".prisma/client").$Enums.Sentiment | null;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    listHealthRecords(query: HealthRecordQueryDto, headers: any): Promise<{
        data: {
            patientId: any;
            patientName: any;
            category: string;
            allergyHistory: any;
            pastHistory: any;
            createdAt: any;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
