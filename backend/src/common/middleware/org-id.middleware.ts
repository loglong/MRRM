import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '../logger';
import { AuthContext } from '../auth/auth-context';

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

    // Extract orgId from header or JWT (if already validated)
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
        await this.prisma.setOrgContext(orgId);

        // Also set AuthContext if user info is available from JWT
        if ((req.user as any)?.sub && (req.user as any)?.roles) {
          AuthContext.set({
            userId: (req.user as any).sub,
            orgId: (req.user as any).orgId,
            role: (req.user as any).roles?.[0] || 'USER',
          });
        }
      } catch (error) {
        this.logger.warn(`Could not set RLS org_id: ${error}`, 'OrgIdMiddleware');
      }
    }

    // Cleanup AuthContext after request
    res.on('close', () => {
      AuthContext.clear();
    });

    next();
  }
}
