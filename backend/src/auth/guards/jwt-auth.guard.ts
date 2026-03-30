import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthContext } from '../../common/auth/auth-context';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, _info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }

    // Set AuthContext for tenant middleware
    const request = context.switchToHttp().getRequest();
    AuthContext.set({
      userId: user.sub,
      orgId: user.orgId,
      role: user.roles?.[0] || 'USER',
    });

    // Set org context in PostgreSQL session for RLS
    try {
      const prisma = request.prisma || (request as any).app?.get('PrismaService');
      if (prisma) {
        prisma.$executeRaw`SELECT set_config('app.current_org_id', ${user.orgId}, true)`.catch(() => {});
      }
    } catch (e) {
      // Ignore - RLS may not be available
    }

    return user;
  }
}
