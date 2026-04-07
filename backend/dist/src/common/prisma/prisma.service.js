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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const logger_1 = require("../logger");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'error' },
                { emit: 'event', level: 'warn' },
            ],
        });
        this.logger = new logger_1.Logger('PrismaService');
    }
    async onModuleInit() {
        this.logger.log('Connecting to database...', 'PrismaService');
        await this.$connect();
        await this.$executeRaw `
      SELECT set_config('app.current_org_id', '00000000-0000-0000-0000-000000000000', false)
    `.catch(() => {
            this.logger.warn('Could not set app.current_org_id', 'PrismaService');
        });
        this.logger.log('Database connected', 'PrismaService');
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database disconnected', 'PrismaService');
    }
    async enableShutdownHooks(app) {
        this.$on;
    }
    async setOrgContext(orgId) {
        try {
            await this.$executeRaw `SELECT set_config('app.current_org_id', ${orgId}, true)`;
        }
        catch (error) {
            this.logger.warn(`Could not set org context: ${error}`, 'PrismaService');
        }
    }
    async clearOrgContext() {
        try {
            await this.$executeRaw `SELECT set_config('app.current_org_id', '00000000-0000-0000-0000-000000000000', true)`;
        }
        catch (error) {
            this.logger.warn(`Could not clear org context: ${error}`, 'PrismaService');
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map