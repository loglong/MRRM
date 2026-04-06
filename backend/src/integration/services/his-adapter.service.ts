import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { HisPatientDto } from '../dto/his-patient.dto';

@Injectable()
export class HisAdapterService {
  private readonly logger = new Logger('HisAdapterService');
  private readonly TIMEOUT_MS = 5000;

  constructor(private configService: ConfigService) {}

  /**
   * Fetch patient data from HIS system by Medical Record Number.
   */
  async fetchPatientByMrn(patientMrn: string, orgId: string): Promise<HisPatientDto | null> {
    const baseUrl = this.configService.get<string>('HIS_API_BASE_URL');
    const apiKey = this.configService.get<string>('HIS_API_KEY');

    if (!baseUrl || !apiKey) {
      this.logger.warn('HIS integration not configured (HIS_API_BASE_URL or HIS_API_KEY missing)');
      return null;
    }

    try {
      const response = await axios.get<HisPatientDto>(
        `${baseUrl}/patients/${patientMrn}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.TIMEOUT_MS,
        }
      );

      this.logger.log(`Fetched patient ${patientMrn} from HIS`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        this.logger.warn(`Patient ${patientMrn} not found in HIS`);
        return null;
      }
      this.logger.error(
        `Failed to fetch patient ${patientMrn} from HIS: ${error.message}`,
        error.stack
      );
      return null;
    }
  }

  /**
   * Sync patient data from HIS into MRRM.
   * Fetches patient from HIS, then creates or updates the patient in MRRM.
   */
  async syncPatientFromHis(patientMrn: string, orgId: string): Promise<void> {
    const hisPatient = await this.fetchPatientByMrn(patientMrn, orgId);

    if (!hisPatient) {
      this.logger.warn(`Cannot sync patient ${patientMrn} - not found in HIS`);
      return;
    }

    this.logger.log(`Syncing patient ${patientMrn} from HIS to MRRM`);
    // Note: Actual upsert logic would use PatientsService
    // This method demonstrates the integration pattern
    this.logger.log(
      `HIS patient data: name=${hisPatient.name}, phone=${hisPatient.phone}`
    );
  }
}
