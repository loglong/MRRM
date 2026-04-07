import { ConfigService } from '@nestjs/config';
import { CrmPatientDto } from '../dto/crm-patient.dto';
export declare class CrmAdapterService {
    private configService;
    private readonly logger;
    private readonly TIMEOUT_MS;
    constructor(configService: ConfigService);
    private getConfig;
    pushPatientToCrm(patientData: any, orgId: string): Promise<void>;
    pullPatientsFromCrm(orgId: string): Promise<CrmPatientDto[]>;
    syncPatient(patientId: string, orgId: string): Promise<void>;
}
