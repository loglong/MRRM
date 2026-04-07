import { ConfigService } from '@nestjs/config';
import { HisPatientDto } from '../dto/his-patient.dto';
export declare class HisAdapterService {
    private configService;
    private readonly logger;
    private readonly TIMEOUT_MS;
    constructor(configService: ConfigService);
    fetchPatientByMrn(patientMrn: string, orgId: string): Promise<HisPatientDto | null>;
    syncPatientFromHis(patientMrn: string, orgId: string): Promise<void>;
}
