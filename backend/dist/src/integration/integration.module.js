"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const integration_controller_1 = require("./integration.controller");
const webhook_controller_1 = require("./webhook.controller");
const webhook_service_1 = require("./webhook.service");
const his_adapter_service_1 = require("./services/his-adapter.service");
const crm_adapter_service_1 = require("./services/crm-adapter.service");
const bi_adapter_service_1 = require("./services/bi-adapter.service");
const prisma_module_1 = require("../common/prisma/prisma.module");
const patients_module_1 = require("../patients/patients.module");
const health_module_1 = require("../health/health.module");
let IntegrationModule = class IntegrationModule {
};
exports.IntegrationModule = IntegrationModule;
exports.IntegrationModule = IntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, patients_module_1.PatientsModule, health_module_1.HealthModule],
        controllers: [integration_controller_1.IntegrationController, webhook_controller_1.WebhookController],
        providers: [webhook_service_1.WebhookService, his_adapter_service_1.HisAdapterService, crm_adapter_service_1.CrmAdapterService, bi_adapter_service_1.BiAdapterService],
        exports: [webhook_service_1.WebhookService, his_adapter_service_1.HisAdapterService, crm_adapter_service_1.CrmAdapterService, bi_adapter_service_1.BiAdapterService],
    })
], IntegrationModule);
//# sourceMappingURL=integration.module.js.map