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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const logger_1 = require("../../common/logger");
const client_1 = require("@prisma/client");
let PermissionsService = class PermissionsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('PermissionsService');
    }
    async onModuleInit() {
        await this.seedDefaultPermissions();
    }
    async findAll() {
        return this.prisma.permission.findMany({
            orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
        });
    }
    async findByCode(code) {
        return this.prisma.permission.findUnique({
            where: { code },
        });
    }
    async findById(id) {
        return this.prisma.permission.findUnique({
            where: { id },
            include: { roles: { include: { role: true } } },
        });
    }
    async seedDefaultPermissions() {
        const existingPermissions = await this.prisma.permission.findMany();
        if (existingPermissions.length > 0) {
            this.logger.log(`Permissions already seeded (${existingPermissions.length})`, 'PermissionsService');
            return;
        }
        const defaultPermissions = [
            { code: 'menu:dashboard', name: 'Dashboard', type: client_1.PermissionType.MENU, menuPath: '/dashboard', sortOrder: 1 },
            { code: 'menu:patients', name: 'Patients', type: client_1.PermissionType.MENU, menuPath: '/patients', sortOrder: 2 },
            { code: 'menu:demands', name: 'Demands', type: client_1.PermissionType.MENU, menuPath: '/demands', sortOrder: 3 },
            { code: 'menu:paths', name: 'Treatment Paths', type: client_1.PermissionType.MENU, menuPath: '/paths', sortOrder: 4 },
            { code: 'menu:touchpoints', name: 'Touchpoints', type: client_1.PermissionType.MENU, menuPath: '/touchpoints', sortOrder: 5 },
            { code: 'menu:followups', name: 'Follow-ups', type: client_1.PermissionType.MENU, menuPath: '/followups', sortOrder: 6 },
            { code: 'menu:reports', name: 'Reports', type: client_1.PermissionType.MENU, menuPath: '/reports', sortOrder: 7 },
            { code: 'menu:admin', name: 'Admin', type: client_1.PermissionType.MENU, menuPath: '/admin', sortOrder: 8 },
            { code: 'patient:create', name: 'Create Patient', type: client_1.PermissionType.BUTTON, sortOrder: 101 },
            { code: 'patient:read', name: 'View Patient', type: client_1.PermissionType.BUTTON, sortOrder: 102 },
            { code: 'patient:update', name: 'Update Patient', type: client_1.PermissionType.BUTTON, sortOrder: 103 },
            { code: 'patient:delete', name: 'Delete Patient', type: client_1.PermissionType.BUTTON, sortOrder: 104 },
            { code: 'demand:create', name: 'Create Demand', type: client_1.PermissionType.BUTTON, sortOrder: 201 },
            { code: 'demand:read', name: 'View Demand', type: client_1.PermissionType.BUTTON, sortOrder: 202 },
            { code: 'demand:update', name: 'Update Demand', type: client_1.PermissionType.BUTTON, sortOrder: 203 },
            { code: 'demand:delete', name: 'Delete Demand', type: client_1.PermissionType.BUTTON, sortOrder: 204 },
            { code: 'path:create', name: 'Create Path', type: client_1.PermissionType.BUTTON, sortOrder: 301 },
            { code: 'path:read', name: 'View Path', type: client_1.PermissionType.BUTTON, sortOrder: 302 },
            { code: 'path:update', name: 'Update Path', type: client_1.PermissionType.BUTTON, sortOrder: 303 },
            { code: 'path:delete', name: 'Delete Path', type: client_1.PermissionType.BUTTON, sortOrder: 304 },
            { code: 'touchpoint:create', name: 'Create Touchpoint', type: client_1.PermissionType.BUTTON, sortOrder: 401 },
            { code: 'touchpoint:read', name: 'View Touchpoint', type: client_1.PermissionType.BUTTON, sortOrder: 402 },
            { code: 'touchpoint:update', name: 'Update Touchpoint', type: client_1.PermissionType.BUTTON, sortOrder: 403 },
            { code: 'touchpoint:delete', name: 'Delete Touchpoint', type: client_1.PermissionType.BUTTON, sortOrder: 404 },
            { code: 'followup:create', name: 'Create Follow-up', type: client_1.PermissionType.BUTTON, sortOrder: 501 },
            { code: 'followup:read', name: 'View Follow-up', type: client_1.PermissionType.BUTTON, sortOrder: 502 },
            { code: 'followup:update', name: 'Update Follow-up', type: client_1.PermissionType.BUTTON, sortOrder: 503 },
            { code: 'followup:delete', name: 'Delete Follow-up', type: client_1.PermissionType.BUTTON, sortOrder: 504 },
            { code: 'user:create', name: 'Create User', type: client_1.PermissionType.BUTTON, sortOrder: 601 },
            { code: 'user:read', name: 'View User', type: client_1.PermissionType.BUTTON, sortOrder: 602 },
            { code: 'user:update', name: 'Update User', type: client_1.PermissionType.BUTTON, sortOrder: 603 },
            { code: 'user:delete', name: 'Delete User', type: client_1.PermissionType.BUTTON, sortOrder: 604 },
            { code: 'role:create', name: 'Create Role', type: client_1.PermissionType.BUTTON, sortOrder: 701 },
            { code: 'role:read', name: 'View Role', type: client_1.PermissionType.BUTTON, sortOrder: 702 },
            { code: 'role:update', name: 'Update Role', type: client_1.PermissionType.BUTTON, sortOrder: 703 },
            { code: 'role:delete', name: 'Delete Role', type: client_1.PermissionType.BUTTON, sortOrder: 704 },
            { code: 'report:read', name: 'View Reports', type: client_1.PermissionType.BUTTON, sortOrder: 801 },
            { code: 'report:export', name: 'Export Reports', type: client_1.PermissionType.BUTTON, sortOrder: 802 },
        ];
        try {
            await this.prisma.permission.createMany({
                data: defaultPermissions,
            });
            this.logger.log(`Seeded ${defaultPermissions.length} default permissions`, 'PermissionsService');
        }
        catch (error) {
            this.logger.error('Failed to seed permissions', error instanceof Error ? error.stack : String(error), 'PermissionsService');
        }
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map