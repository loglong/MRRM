import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'mrrm-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    // Look up user with roles and permissions
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });

    if (!user) {
      return {
        sub: payload.sub,
        email: payload.email,
        orgId: payload.orgId,
        roles: [],
        permissions: [],
      };
    }

    // Extract role codes and permission codes
    const roles = user.roles.map((ur) => ur.role.code);
    const permissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => rp.permission.code),
    );

    return {
      sub: user.id,
      email: user.email,
      orgId: user.orgId,
      roles,
      permissions: [...new Set(permissions)], // Deduplicate
    };
  }
}
