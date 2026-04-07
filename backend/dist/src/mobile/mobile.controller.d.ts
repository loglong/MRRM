import { MobileService } from './mobile.service';
import { MobilePatientListDto, MobileDemandListDto } from './dto/mobile-patient.dto';
export declare class MobileController {
    private readonly mobileService;
    constructor(mobileService: MobileService);
    getPatients(dto: MobilePatientListDto, orgId: string): Promise<{
        data: import("./dto/mobile-patient.dto").MobilePatientDto[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDemands(dto: MobileDemandListDto, orgId: string): Promise<{
        data: import("./dto/mobile-patient.dto").MobileDemandDto[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getRecentTouchpoints(orgId: string, limit?: number): Promise<{
        data: import("./dto/mobile-patient.dto").MobileTouchpointDto[];
    }>;
    getPendingFollowups(orgId: string, limit?: number): Promise<{
        data: import("./dto/mobile-patient.dto").MobileFollowupDto[];
    }>;
}
