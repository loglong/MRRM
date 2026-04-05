import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService, LoginDto, AuthResponse } from './auth.service';
import { UsersService } from '../users/users.service';
import { Auth0Client } from './auth0.client';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { LockedException } from './exceptions/locked.exception';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJfxCm4W2', // 'password123'
    name: 'Test User',
    orgId: 'org-123',
    status: 'ACTIVE',
    failedLoginAttempts: 1, // Set to > 0 so reset gets called
    lockedUntil: null,
  };

  beforeEach(async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      incrementFailedLogin: jest.fn(),
      resetFailedLogin: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: Auth0Client, useValue: {} },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(usersService.resetFailedLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return null when user not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await authService.validateUser('notfound@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(usersService.incrementFailedLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw LockedException when account is locked', async () => {
      const lockedUser = {
        ...mockUser,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // Locked for 30 minutes
      };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(lockedUser);

      await expect(
        authService.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow(LockedException);
    });
  });

  describe('login', () => {
    it('should return auth response with access token', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const dto: LoginDto = { email: 'test@example.com', password: 'password123', rememberMe: false };
      const result = await authService.login(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockUser.email);
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      const dto: LoginDto = { email: 'test@example.com', password: 'wrong', rememberMe: false };

      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a new user and return auth response', async () => {
      const newUser = {
        ...mockUser,
        id: 'new-user-123',
        email: 'new@example.com',
      };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue(newUser);

      const registerDto = {
        email: 'new@example.com',
        password: 'Password123',
        name: 'New User',
      };

      const result = await authService.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe(newUser.email);
      expect(usersService.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email already exists', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const registerDto = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      await expect(authService.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getProfile(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue(null);

      await expect(authService.getProfile('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
