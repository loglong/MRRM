import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthContext } from '../../common/auth/auth-context';
import { Logger } from '../../common/logger';
import { Prisma } from '@prisma/client';

// Models that are tenant-aware (have orgId field)
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

// Models that are NOT tenant-aware (system-level)
const SYSTEM_MODELS = ['Organization', 'Permission'];

@Injectable()
export class TenantMiddleware implements OnModuleInit {
  private logger = new Logger('TenantMiddleware');

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('Initializing tenant middleware', 'TenantMiddleware');

    this.prisma.$use(async (params: Prisma.MiddlewareParams, next) => {
      // Skip if no user context (e.g., during seeding, migrations)
      const user = AuthContext.current();
      if (!user) {
        return next(params);
      }

      // Skip non-model operations
      if (params.action === 'findRaw' || params.action === 'aggregate' || params.action === 'groupBy') {
        return next(params);
      }

      // Skip if model is not tenant-aware
      if (!params.model || SYSTEM_MODELS.includes(params.model)) {
        return next(params);
      }

      // Check if this is a tenant-aware model
      if (!TENANT_MODELS.includes(params.model)) {
        return next(params);
      }

      // Add org_id filter to the query
      return this.addTenantFilter(params, next, user.orgId);
    });

    this.logger.log('Tenant middleware registered', 'TenantMiddleware');
  }

  private addTenantFilter(params: Prisma.MiddlewareParams, next: Function, orgId: string): Promise<any> {
    // Modify WHERE clause to include orgId
    if (params.args.where) {
      // If where already has orgId, keep it (don't override user-specified filter)
      // But ensure it matches the current user's org
      params.args.where.orgId = orgId;
    } else {
      params.args.where = { orgId };
    }

    // Log in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(
        `Tenant filter applied: model=${params.model}, action=${params.action}, orgId=${orgId}`,
        'TenantMiddleware',
      );
    }

    return next(params);
  }
}
