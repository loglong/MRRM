"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("./auth.service");
const users_service_1 = require("../users/users.service");
const auth0_client_1 = require("./auth0.client");
const common_1 = require("@nestjs/common");
const locked_exception_1 = require("./exceptions/locked.exception");
const bcrypt = require("bcryptjs");
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));
describe('AuthService', () => {
    let authService;
    let usersService;
    let jwtService;
    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJfxCm4W2',
        name: 'Test User',
        orgId: 'org-123',
        status: 'ACTIVE',
        failedLoginAttempts: 1,
        lockedUntil: null,
    };
    beforeEach(async () => {
        bcrypt.compare.mockResolvedValue(true);
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: users_service_1.UsersService, useValue: usersService },
                { provide: jwt_1.JwtService, useValue: jwtService },
                { provide: auth0_client_1.Auth0Client, useValue: {} },
            ],
        }).compile();
        authService = module.get(auth_service_1.AuthService);
    });
    describe('validateUser', () => {
        it('should return user when credentials are valid', async () => {
            usersService.findByEmail.mockResolvedValue(mockUser);
            const result = await authService.validateUser('test@example.com', 'password123');
            expect(result).toEqual(mockUser);
            expect(usersService.resetFailedLogin).toHaveBeenCalledWith(mockUser.id);
        });
        it('should return null when user not found', async () => {
            usersService.findByEmail.mockResolvedValue(null);
            const result = await authService.validateUser('notfound@example.com', 'password');
            expect(result).toBeNull();
        });
        it('should return null when password is invalid', async () => {
            usersService.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);
            const result = await authService.validateUser('test@example.com', 'wrongpassword');
            expect(result).toBeNull();
            expect(usersService.incrementFailedLogin).toHaveBeenCalledWith(mockUser.id);
        });
        it('should throw LockedException when account is locked', async () => {
            const lockedUser = {
                ...mockUser,
                lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
            };
            usersService.findByEmail.mockResolvedValue(lockedUser);
            await expect(authService.validateUser('test@example.com', 'password123')).rejects.toThrow(locked_exception_1.LockedException);
        });
    });
    describe('login', () => {
        it('should return auth response with access token', async () => {
            usersService.findByEmail.mockResolvedValue(mockUser);
            const dto = { email: 'test@example.com', password: 'password123', rememberMe: false };
            const result = await authService.login(dto);
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe(mockUser.email);
            expect(jwtService.sign).toHaveBeenCalled();
        });
        it('should throw UnauthorizedException for invalid credentials', async () => {
            usersService.findByEmail.mockResolvedValue(null);
            const dto = { email: 'test@example.com', password: 'wrong', rememberMe: false };
            await expect(authService.login(dto)).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    describe('register', () => {
        it('should create a new user and return auth response', async () => {
            const newUser = {
                ...mockUser,
                id: 'new-user-123',
                email: 'new@example.com',
            };
            usersService.findByEmail.mockResolvedValue(null);
            usersService.create.mockResolvedValue(newUser);
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
            usersService.findByEmail.mockResolvedValue(mockUser);
            const registerDto = {
                email: 'test@example.com',
                password: 'Password123',
                name: 'Test User',
            };
            await expect(authService.register(registerDto)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('getProfile', () => {
        it('should return user profile', async () => {
            usersService.findById.mockResolvedValue(mockUser);
            const result = await authService.getProfile(mockUser.id);
            expect(result).toEqual(mockUser);
        });
        it('should throw UnauthorizedException if user not found', async () => {
            usersService.findById.mockResolvedValue(null);
            await expect(authService.getProfile('nonexistent')).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map