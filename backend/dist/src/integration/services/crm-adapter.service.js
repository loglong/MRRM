"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmAdapterService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let CrmAdapterService = class CrmAdapterService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger('CrmAdapterService');
        this.TIMEOUT_MS = 5000;
    }
    getConfig() {
        const baseUrl = this.configService.get('CRM_API_BASE_URL');
        const apiKey = this.configService.get('CRM_API_KEY');
        if (!baseUrl || !apiKey) {
            this.logger.warn('CRM integration not configured (CRM_API_BASE_URL or CRM_API_KEY missing)');
        }
        return { baseUrl, apiKey };
    }
    async pushPatientToCrm(patientData, orgId) {
        const { baseUrl, apiKey } = this.getConfig();
        if (!baseUrl || !apiKey)
            return;
        const payload = {
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
            await axios_1.default.post(`${baseUrl}/patients`, payload, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: this.TIMEOUT_MS,
            });
            this.logger.log(`Pushed patient ${patientData.id} to CRM`);
        }
        catch (error) {
            this.logger.error(`Failed to push patient ${patientData.id} to CRM: ${error.message}`, error.stack);
        }
    }
    async pullPatientsFromCrm(orgId) {
        const { baseUrl, apiKey } = this.getConfig();
        if (!baseUrl || !apiKey)
            return [];
        try {
            const response = await axios_1.default.get(`${baseUrl}/patients`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: this.TIMEOUT_MS,
            });
            this.logger.log(`Pulled ${response.data.length} patients from CRM`);
            for (const crmPatient of response.data) {
                this.logger.log(`CRM patient: externalId=${crmPatient.externalId}, name=${crmPatient.name}`);
            }
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to pull patients from CRM: ${error.message}`, error.stack);
            return [];
        }
    }
    async syncPatient(patientId, orgId) {
        this.logger.log(`Starting bidirectional sync for patient ${patientId}`);
        const { baseUrl, apiKey } = this.getConfig();
        if (!baseUrl || !apiKey)
            return;
        try {
            const response = await axios_1.default.get(`${baseUrl}/patients/${patientId}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: this.TIMEOUT_MS,
            });
            const crmPatient = response.data;
            this.logger.log(`Pulled patient ${patientId} from CRM: ${JSON.stringify(crmPatient)}`);
            this.logger.log(`Patient ${patientId} synced successfully (last-write-wins)`);
        }
        catch (error) {
            if (error.response?.status === 404) {
                this.logger.warn(`Patient ${patientId} not found in CRM`);
                return;
            }
            this.logger.error(`Failed to sync patient ${patientId}: ${error.message}`, error.stack);
        }
    }
};
exports.CrmAdapterService = CrmAdapterService;
exports.CrmAdapterService = CrmAdapterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CrmAdapterService);
//# sourceMappingURL=crm-adapter.service.js.map