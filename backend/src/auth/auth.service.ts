import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Auth0Client } from './auth0.client';
import { Logger } from '../common/logger';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto';
import { LockedException } from './exceptions/locked.exception';

export { LoginDto, RegisterDto };

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    orgId: string;
  };
}

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auth0Client: Auth0Client,
  ) {}

  async validateUser(email: string, password: string, orgId?: string): Promise<any> {
    const user = await this.usersService.findByEmail(email, orgId);
    if (!user) {
      return null;
    }

    // Check if user is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new LockedException(user.lockedUntil);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      // Increment failed login attempts
      await this.usersService.incrementFailedLogin(user.id);
      return null;
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await this.usersService.resetFailedLogin(user.id);
    }

    return user;
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(dto.email, dto.password, dto.orgId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      orgId: user.orgId,
      roles: user.roles?.map((r: any) => r.role?.code) || [],
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        orgId: user.orgId,
      },
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existing = await this.usersService.findByEmail(dto.email, dto.orgId);
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create user with default org if not provided
    const orgId = dto.orgId || 'default-org';

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password, // Service hashes with bcrypt 12 rounds
      name: dto.name,
      phone: dto.phone,
      orgId,
    });

    const payload = {
      sub: user.id,
      email: user.email,
      orgId: user.orgId,
      roles: user.roles?.map((r: any) => r.role?.code) || [],
    };

    this.logger.log(`User registered: ${user.email}`, 'AuthService');

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        orgId: user.orgId,
      },
    };
  }

  async ssoLogin(authingToken: string): Promise<AuthResponse> {
    try {
      // Verify token with Authing
      const authingUser = await this.auth0Client.verifyToken(authingToken);

      // Find or create user
      let user = await this.usersService.findByEmail(authingUser.email);

      if (!user) {
        // Auto-provision user from SSO
        user = await this.usersService.createFromSSO({
          email: authingUser.email,
          name: authingUser.name || authingUser.email.split('@')[0],
          orgId: authingUser.orgId || 'default-org',
        });
      }

      const payload = {
        sub: user.id,
        email: user.email,
        orgId: user.orgId,
      };

      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          orgId: user.orgId,
        },
      };
    } catch (error) {
      this.logger.error('SSO login failed', error instanceof Error ? error.stack : String(error), 'AuthService');
      throw new BadRequestException('SSO authentication failed');
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
