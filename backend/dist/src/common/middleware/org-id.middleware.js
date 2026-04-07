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
exports.OrgIdMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const logger_1 = require("../logger");
const auth_context_1 = require("../auth/auth-context");
let OrgIdMiddleware = class OrgIdMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('OrgIdMiddleware');
    }
    async use(req, res, next) {
        const publicPaths = ['/health', '/api/docs', '/api/v1/auth'];
        if (publicPaths.some((path) => req.path.startsWith(path))) {
            return next();
        }
        let orgId = req.headers['x-org-id'];
        if (!orgId && req.user?.orgId) {
            orgId = req.user.orgId;
        }
        if (!orgId) {
            if (req.path.includes('/auth/')) {
                return next();
            }
            this.logger.warn(`No orgId found for ${req.method} ${req.path}`, 'OrgIdMiddleware');
        }
        req.orgId = orgId;
        if (orgId) {
            try {
                await this.prisma.setOrgContext(orgId);
                if (req.user?.sub && req.user?.roles) {
                    auth_context_1.AuthContext.set({
                        userId: req.user.sub,
                        orgId: req.user.orgId,
                        role: req.user.roles?.[0] || 'USER',
                    });
                }
            }
            catch (error) {
                this.logger.warn(`Could not set RLS org_id: ${error}`, 'OrgIdMiddleware');
            }
        }
        res.on('close', () => {
            auth_context_1.AuthContext.clear();
        });
        next();
    }
};
exports.OrgIdMiddleware = OrgIdMiddleware;
exports.OrgIdMiddleware = OrgIdMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrgIdMiddleware);
//# sourceMappingURL=org-id.middleware.js.map