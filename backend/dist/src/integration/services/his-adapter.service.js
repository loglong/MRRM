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
exports.HisAdapterService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let HisAdapterService = class HisAdapterService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger('HisAdapterService');
        this.TIMEOUT_MS = 5000;
    }
    async fetchPatientByMrn(patientMrn, orgId) {
        const baseUrl = this.configService.get('HIS_API_BASE_URL');
        const apiKey = this.configService.get('HIS_API_KEY');
        if (!baseUrl || !apiKey) {
            this.logger.warn('HIS integration not configured (HIS_API_BASE_URL or HIS_API_KEY missing)');
            return null;
        }
        try {
            const response = await axios_1.default.get(`${baseUrl}/patients/${patientMrn}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: this.TIMEOUT_MS,
            });
            this.logger.log(`Fetched patient ${patientMrn} from HIS`);
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 404) {
                this.logger.warn(`Patient ${patientMrn} not found in HIS`);
                return null;
            }
            this.logger.error(`Failed to fetch patient ${patientMrn} from HIS: ${error.message}`, error.stack);
            return null;
        }
    }
    async syncPatientFromHis(patientMrn, orgId) {
        const hisPatient = await this.fetchPatientByMrn(patientMrn, orgId);
        if (!hisPatient) {
            this.logger.warn(`Cannot sync patient ${patientMrn} - not found in HIS`);
            return;
        }
        this.logger.log(`Syncing patient ${patientMrn} from HIS to MRRM`);
        this.logger.log(`HIS patient data: name=${hisPatient.name}, phone=${hisPatient.phone}`);
    }
};
exports.HisAdapterService = HisAdapterService;
exports.HisAdapterService = HisAdapterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HisAdapterService);
//# sourceMappingURL=his-adapter.service.js.map