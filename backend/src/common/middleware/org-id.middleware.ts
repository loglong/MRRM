import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '../logger';

// Extend Express Request to include orgId
declare global {
  namespace Express {
    interface Request {
      orgId?: string;
      userId?: string;
    }
  }
}

@Injectable()
export class OrgIdMiddleware implements NestMiddleware {
  private logger = new Logger('OrgIdMiddleware');

  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip for public routes
    const publicPaths = ['/health', '/api/docs', '/api/v1/auth'];
    if (publicPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Extract orgId from header, subdomain, or JWT
    let orgId = req.headers['x-org-id'] as string;

    if (!orgId && (req.user as any)?.orgId) {
      orgId = (req.user as any).orgId;
    }

    // If still no orgId, this is a public route or invalid request
    if (!orgId) {
      // Check if it's an auth route (user may not have org yet)
      if (req.path.includes('/auth/')) {
        return next();
      }
      this.logger.warn(`No orgId found for ${req.method} ${req.path}`, 'OrgIdMiddleware');
    }

    // Set orgId in request for downstream use
    req.orgId = orgId;

    // Set PostgreSQL session variable for RLS
    if (orgId) {
      try {
        await this.prisma.$executeRaw`
          SELECT set_config('app.current_org_id', ${orgId}, true)
        `;
      } catch (error) {
        this.logger.warn(`Could not set RLS org_id: ${error}`, 'OrgIdMiddleware');
      }
    }

    next();
  }
}
