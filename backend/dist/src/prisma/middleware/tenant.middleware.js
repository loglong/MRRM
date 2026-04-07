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
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const auth_context_1 = require("../../common/auth/auth-context");
const logger_1 = require("../../common/logger");
const TENANT_MODELS = [
    'User',
    'Patient',
    'Demand',
    'Path',
    'PathStep',
    'Touchpoint',
    'FollowupPlan',
    'FollowupRecord',
    'JourneyMilestone',
    'AuditLog',
    'Role',
];
const SYSTEM_MODELS = ['Organization', 'Permission'];
let TenantMiddleware = class TenantMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('TenantMiddleware');
    }
    async onModuleInit() {
        this.logger.log('Initializing tenant middleware', 'TenantMiddleware');
        this.prisma.$use(async (params, next) => {
            const user = auth_context_1.AuthContext.current();
            if (!user) {
                return next(params);
            }
            if (params.action === 'findRaw' || params.action === 'aggregate' || params.action === 'groupBy') {
                return next(params);
            }
            if (!params.model || SYSTEM_MODELS.includes(params.model)) {
                return next(params);
            }
            if (!TENANT_MODELS.includes(params.model)) {
                return next(params);
            }
            return this.addTenantFilter(params, next, user.orgId);
        });
        this.logger.log('Tenant middleware registered', 'TenantMiddleware');
    }
    addTenantFilter(params, next, orgId) {
        const readActions = ['findMany', 'findFirst', 'findUnique', 'count', 'updateMany', 'deleteMany'];
        if (readActions.includes(params.action)) {
            if (params.args.where) {
                params.args.where.orgId = orgId;
            }
            else {
                params.args.where = { orgId };
            }
        }
        if (process.env.NODE_ENV !== 'production') {
            this.logger.debug(`Tenant filter applied: model=${params.model}, action=${params.action}, orgId=${orgId}`, 'TenantMiddleware');
        }
        return next(params);
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map