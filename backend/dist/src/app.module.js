"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const organizations_module_1 = require("./organizations/organizations.module");
const audit_module_1 = require("./audit/audit.module");
const prisma_module_1 = require("./common/prisma/prisma.module");
const encryption_module_1 = require("./common/encryption/encryption.module");
const patients_module_1 = require("./patients/patients.module");
const demands_module_1 = require("./demands/demands.module");
const paths_module_1 = require("./paths/paths.module");
const notifications_module_1 = require("./notifications/notifications.module");
const touchpoints_module_1 = require("./touchpoints/touchpoints.module");
const followups_module_1 = require("./followups/followups.module");
const journey_module_1 = require("./journey/journey.module");
const reports_module_1 = require("./reports/reports.module");
const experience_module_1 = require("./experience/experience.module");
const rabbitmq_module_1 = require("./rabbitmq/rabbitmq.module");
const integration_module_1 = require("./integration/integration.module");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
const org_id_middleware_1 = require("./common/middleware/org-id.middleware");
const health_module_1 = require("./health/health.module");
const mobile_module_1 = require("./mobile/mobile.module");
const ai_module_1 = require("./ai/ai.module");
const automation_module_1 = require("./automation/automation.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(logger_middleware_1.LoggerMiddleware)
            .forRoutes('*');
        consumer
            .apply(org_id_middleware_1.OrgIdMiddleware)
            .exclude('/health', '/api/docs/(.*)', '/api/v1/auth/(.*)')
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            prisma_module_1.PrismaModule,
            encryption_module_1.EncryptionModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            audit_module_1.AuditModule,
            patients_module_1.PatientsModule,
            demands_module_1.DemandsModule,
            paths_module_1.PathsModule,
            notifications_module_1.NotificationsModule,
            touchpoints_module_1.TouchpointsModule,
            followups_module_1.FollowupsModule,
            journey_module_1.JourneyModule,
            reports_module_1.ReportsModule,
            rabbitmq_module_1.RabbitMQModule,
            experience_module_1.ExperienceModule,
            integration_module_1.IntegrationModule,
            health_module_1.HealthModule,
            mobile_module_1.MobileModule,
            ai_module_1.AiModule,
            automation_module_1.AutomationModule,
        ],
        controllers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map