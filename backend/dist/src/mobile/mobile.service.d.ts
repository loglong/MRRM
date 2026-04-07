import { PrismaService } from '../common/prisma/prisma.service';
import { MobilePatientListDto, MobileDemandListDto, MobilePatientDto, MobileDemandDto, MobileTouchpointDto, MobileFollowupDto } from './dto/mobile-patient.dto';
export declare class MobileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPatients(dto: MobilePatientListDto, orgId: string): Promise<{
        data: MobilePatientDto[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDemands(dto: MobileDemandListDto, orgId: string): Promise<{
        data: MobileDemandDto[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getRecentTouchpoints(orgId: string, limit?: number): Promise<{
        data: MobileTouchpointDto[];
    }>;
    getPendingFollowups(orgId: string, limit?: number): Promise<{
        data: MobileFollowupDto[];
    }>;
}
