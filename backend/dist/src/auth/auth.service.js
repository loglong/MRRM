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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const auth0_client_1 = require("./auth0.client");
const logger_1 = require("../common/logger");
const bcrypt = require("bcryptjs");
const locked_exception_1 = require("./exceptions/locked.exception");
let AuthService = class AuthService {
    constructor(usersService, jwtService, auth0Client) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.auth0Client = auth0Client;
        this.logger = new logger_1.Logger('AuthService');
    }
    async validateUser(email, password, orgId) {
        const user = await this.usersService.findByEmail(email, orgId);
        if (!user) {
            return null;
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new locked_exception_1.LockedException(user.lockedUntil);
        }
        if (user.status === 'INACTIVE') {
            throw new common_1.UnauthorizedException('User account is inactive');
        }
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            await this.usersService.incrementFailedLogin(user.id);
            return null;
        }
        if (user.failedLoginAttempts > 0) {
            await this.usersService.resetFailedLogin(user.id);
        }
        return user;
    }
    async login(dto) {
        const user = await this.validateUser(dto.email, dto.password, dto.orgId);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            orgId: user.orgId,
            roles: user.roles?.map((r) => r.role?.code) || [],
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
    async register(dto) {
        const existing = await this.usersService.findByEmail(dto.email, dto.orgId);
        if (existing) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const orgId = dto.orgId || 'default-org';
        const user = await this.usersService.create({
            email: dto.email,
            password: dto.password,
            name: dto.name,
            phone: dto.phone,
            orgId,
        });
        const payload = {
            sub: user.id,
            email: user.email,
            orgId: user.orgId,
            roles: user.roles?.map((r) => r.role?.code) || [],
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
    async ssoLogin(authingToken) {
        try {
            const authingUser = await this.auth0Client.verifyToken(authingToken);
            let user = await this.usersService.findByEmail(authingUser.email);
            if (!user) {
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
        }
        catch (error) {
            this.logger.error('SSO login failed', error instanceof Error ? error.stack : String(error), 'AuthService');
            throw new common_1.BadRequestException('SSO authentication failed');
        }
    }
    async getProfile(userId) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        auth0_client_1.Auth0Client])
], AuthService);
//# sourceMappingURL=auth.service.js.map