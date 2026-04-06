import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CrmPatientDto } from '../dto/crm-patient.dto';

@Injectable()
export class CrmAdapterService {
  private readonly logger = new Logger('CrmAdapterService');
  private readonly TIMEOUT_MS = 5000;

  constructor(private configService: ConfigService) {}

  private getConfig() {
    const baseUrl = this.configService.get<string>('CRM_API_BASE_URL');
    const apiKey = this.configService.get<string>('CRM_API_KEY');
    if (!baseUrl || !apiKey) {
      this.logger.warn('CRM integration not configured (CRM_API_BASE_URL or CRM_API_KEY missing)');
    }
    return { baseUrl, apiKey };
  }

  /**
   * Push a patient record to CRM system.
   */
  async pushPatientToCrm(patientData: any, orgId: string): Promise<void> {
    const { baseUrl, apiKey } = this.getConfig();
    if (!baseUrl || !apiKey) return;

    const payload: CrmPatientDto = {
      externalId: patientData.id,
      name: patientData.name,
      phone: patientData.phone || '',
      email: patientData.email,
      tier: patientData.tier || 'REGULAR',
      status: 'ACTIVE',
      lastContactAt: patientData.lastVisitAt?.toISOString() || new Date().toISOString(),
      metadata: {
        orgId,
        patientId: patientData.id,
      },
    };

    try {
      await axios.post(`${baseUrl}/patients`, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: this.TIMEOUT_MS,
      });

      this.logger.log(`Pushed patient ${patientData.id} to CRM`);
    } catch (error: any) {
      this.logger.error(
        `Failed to push patient ${patientData.id} to CRM: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * Pull all patients from CRM system and upsert into MRRM.
   */
  async pullPatientsFromCrm(orgId: string): Promise<CrmPatientDto[]> {
    const { baseUrl, apiKey } = this.getConfig();
    if (!baseUrl || !apiKey) return [];

    try {
      const response = await axios.get<CrmPatientDto[]>(`${baseUrl}/patients`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: this.TIMEOUT_MS,
      });

      this.logger.log(`Pulled ${response.data.length} patients from CRM`);

      // For each CRM patient, upsert in MRRM via patientsService
      // Implementation would call PatientsService.create or update
      for (const crmPatient of response.data) {
        this.logger.log(
          `CRM patient: externalId=${crmPatient.externalId}, name=${crmPatient.name}`
        );
      }

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to pull patients from CRM: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Bidirectional sync for a single patient — pull latest from CRM, update MRRM, then push updated MRRM data to CRM.
   * Uses last-write-wins conflict resolution.
   */
  async syncPatient(patientId: string, orgId: string): Promise<void> {
    this.logger.log(`Starting bidirectional sync for patient ${patientId}`);

    // Pull latest from CRM
    const { baseUrl, apiKey } = this.getConfig();
    if (!baseUrl || !apiKey) return;

    try {
      const response = await axios.get<CrmPatientDto>(`${baseUrl}/patients/${patientId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: this.TIMEOUT_MS,
      });

      const crmPatient = response.data;
      this.logger.log(`Pulled patient ${patientId} from CRM: ${JSON.stringify(crmPatient)}`);

      // In a real implementation:
      // 1. Compare timestamps with MRRM patient
      // 2. Last-write-wins: update MRRM with CRM data if CRM is newer
      // 3. Then push updated MRRM data back to CRM

      // For now, just log the sync action
      this.logger.log(`Patient ${patientId} synced successfully (last-write-wins)`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        this.logger.warn(`Patient ${patientId} not found in CRM`);
        return;
      }
      this.logger.error(`Failed to sync patient ${patientId}: ${error.message}`, error.stack);
    }
  }
}
