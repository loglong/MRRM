import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Logger } from '../../common/logger';
import { PermissionType } from '@prisma/client';

@Injectable()
export class PermissionsService implements OnModuleInit {
  private logger = new Logger('PermissionsService');

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultPermissions();
  }

  async findAll(): Promise<any[]> {
    return this.prisma.permission.findMany({
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findByCode(code: string): Promise<any | null> {
    return this.prisma.permission.findUnique({
      where: { code },
    });
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.permission.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
  }

  async seedDefaultPermissions(): Promise<void> {
    const existingPermissions = await this.prisma.permission.findMany();
    if (existingPermissions.length > 0) {
      this.logger.log(`Permissions already seeded (${existingPermissions.length})`, 'PermissionsService');
      return;
    }

    const defaultPermissions = [
      // Menu permissions
      { code: 'menu:dashboard', name: 'Dashboard', type: PermissionType.MENU, menuPath: '/dashboard', sortOrder: 1 },
      { code: 'menu:patients', name: 'Patients', type: PermissionType.MENU, menuPath: '/patients', sortOrder: 2 },
      { code: 'menu:demands', name: 'Demands', type: PermissionType.MENU, menuPath: '/demands', sortOrder: 3 },
      { code: 'menu:paths', name: 'Treatment Paths', type: PermissionType.MENU, menuPath: '/paths', sortOrder: 4 },
      { code: 'menu:touchpoints', name: 'Touchpoints', type: PermissionType.MENU, menuPath: '/touchpoints', sortOrder: 5 },
      { code: 'menu:followups', name: 'Follow-ups', type: PermissionType.MENU, menuPath: '/followups', sortOrder: 6 },
      { code: 'menu:reports', name: 'Reports', type: PermissionType.MENU, menuPath: '/reports', sortOrder: 7 },
      { code: 'menu:admin', name: 'Admin', type: PermissionType.MENU, menuPath: '/admin', sortOrder: 8 },

      // Patient permissions
      { code: 'patient:create', name: 'Create Patient', type: PermissionType.BUTTON, sortOrder: 101 },
      { code: 'patient:read', name: 'View Patient', type: PermissionType.BUTTON, sortOrder: 102 },
      { code: 'patient:update', name: 'Update Patient', type: PermissionType.BUTTON, sortOrder: 103 },
      { code: 'patient:delete', name: 'Delete Patient', type: PermissionType.BUTTON, sortOrder: 104 },

      // Demand permissions
      { code: 'demand:create', name: 'Create Demand', type: PermissionType.BUTTON, sortOrder: 201 },
      { code: 'demand:read', name: 'View Demand', type: PermissionType.BUTTON, sortOrder: 202 },
      { code: 'demand:update', name: 'Update Demand', type: PermissionType.BUTTON, sortOrder: 203 },
      { code: 'demand:delete', name: 'Delete Demand', type: PermissionType.BUTTON, sortOrder: 204 },

      // Path permissions
      { code: 'path:create', name: 'Create Path', type: PermissionType.BUTTON, sortOrder: 301 },
      { code: 'path:read', name: 'View Path', type: PermissionType.BUTTON, sortOrder: 302 },
      { code: 'path:update', name: 'Update Path', type: PermissionType.BUTTON, sortOrder: 303 },
      { code: 'path:delete', name: 'Delete Path', type: PermissionType.BUTTON, sortOrder: 304 },

      // Touchpoint permissions
      { code: 'touchpoint:create', name: 'Create Touchpoint', type: PermissionType.BUTTON, sortOrder: 401 },
      { code: 'touchpoint:read', name: 'View Touchpoint', type: PermissionType.BUTTON, sortOrder: 402 },
      { code: 'touchpoint:update', name: 'Update Touchpoint', type: PermissionType.BUTTON, sortOrder: 403 },
      { code: 'touchpoint:delete', name: 'Delete Touchpoint', type: PermissionType.BUTTON, sortOrder: 404 },

      // Followup permissions
      { code: 'followup:create', name: 'Create Follow-up', type: PermissionType.BUTTON, sortOrder: 501 },
      { code: 'followup:read', name: 'View Follow-up', type: PermissionType.BUTTON, sortOrder: 502 },
      { code: 'followup:update', name: 'Update Follow-up', type: PermissionType.BUTTON, sortOrder: 503 },
      { code: 'followup:delete', name: 'Delete Follow-up', type: PermissionType.BUTTON, sortOrder: 504 },

      // User management permissions
      { code: 'user:create', name: 'Create User', type: PermissionType.BUTTON, sortOrder: 601 },
      { code: 'user:read', name: 'View User', type: PermissionType.BUTTON, sortOrder: 602 },
      { code: 'user:update', name: 'Update User', type: PermissionType.BUTTON, sortOrder: 603 },
      { code: 'user:delete', name: 'Delete User', type: PermissionType.BUTTON, sortOrder: 604 },

      // Role management permissions
      { code: 'role:create', name: 'Create Role', type: PermissionType.BUTTON, sortOrder: 701 },
      { code: 'role:read', name: 'View Role', type: PermissionType.BUTTON, sortOrder: 702 },
      { code: 'role:update', name: 'Update Role', type: PermissionType.BUTTON, sortOrder: 703 },
      { code: 'role:delete', name: 'Delete Role', type: PermissionType.BUTTON, sortOrder: 704 },

      // Report permissions
      { code: 'report:read', name: 'View Reports', type: PermissionType.BUTTON, sortOrder: 801 },
      { code: 'report:export', name: 'Export Reports', type: PermissionType.BUTTON, sortOrder: 802 },
    ];

    try {
      await this.prisma.permission.createMany({
        data: defaultPermissions,
      });
      this.logger.log(`Seeded ${defaultPermissions.length} default permissions`, 'PermissionsService');
    } catch (error) {
      this.logger.error('Failed to seed permissions', error instanceof Error ? error.stack : String(error), 'PermissionsService');
    }
  }
}
