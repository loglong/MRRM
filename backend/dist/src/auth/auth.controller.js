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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const dto_1 = require("./dto");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto, res) {
        const result = await this.authService.register(dto);
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('refresh_token', result.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return result;
    }
    async login(dto, res) {
        const result = await this.authService.login(dto);
        const isProduction = process.env.NODE_ENV === 'production';
        const maxAge = dto.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
        res.cookie('refresh_token', result.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge,
        });
        return result;
    }
    async logout(res) {
        res.clearCookie('refresh_token');
        return { success: true };
    }
    async refresh(req) {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
            return { accessToken: null };
        }
        return { accessToken: refreshToken };
    }
    async getProfile(req) {
        return this.authService.getProfile(req.user.sub);
    }
    async getAuthingSSOUrl() {
        const appId = process.env.AUTHING_APP_ID;
        const redirectUri = encodeURIComponent(`${process.env.API_BASE_URL}/auth/authing/callback`);
        const url = `https://oauth.authing.cn/oauth/authorize?app_id=${appId}&redirect_uri=${redirectUri}&response_type=code`;
        return { url };
    }
    async authingCallback(code, res) {
        const result = await this.authService.ssoLogin(code);
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('refresh_token', result.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return result;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Email already exists or validation failed' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(dto_1.RegisterDtoSchema))),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(dto_1.LoginDtoSchema))),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout current user' }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token using httpOnly cookie' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('authing/sso-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Authing SSO login URL' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAuthingSSOUrl", null);
__decorate([
    (0, common_1.Post)('authing/callback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Authing SSO callback' }),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "authingCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map