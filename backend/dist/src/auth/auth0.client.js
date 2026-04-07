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
exports.Auth0Client = void 0;
const common_1 = require("@nestjs/common");
const logger_1 = require("../common/logger");
let Auth0Client = class Auth0Client {
    constructor() {
        this.logger = new logger_1.Logger('Auth0Client');
        this.baseUrl = 'https://oauth.authing.cn';
        this.appId = process.env.AUTHING_APP_ID || '';
        this.appSecret = process.env.AUTHING_APP_SECRET || '';
        this.baseUrl = process.env.AUTHING_ENDPOINT || this.baseUrl;
    }
    async verifyToken(token) {
        try {
            const payload = this.decodeJWT(token);
            if (!payload) {
                throw new Error('Invalid token');
            }
            return {
                id: payload.sub || payload.id,
                email: payload.email,
                name: payload.name,
                orgId: payload.orgId || payload.namespace,
                phone: payload.phone,
            };
        }
        catch (error) {
            this.logger.error('Token verification failed', error instanceof Error ? error.stack : String(error), 'Auth0Client');
            throw new Error('Token verification failed');
        }
    }
    decodeJWT(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3)
                return null;
            const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
            return JSON.parse(payload);
        }
        catch {
            return null;
        }
    }
    async getUserInfo(accessToken) {
        this.logger.log('Fetching user info from Authing', 'Auth0Client');
        return {
            id: '',
            email: '',
        };
    }
};
exports.Auth0Client = Auth0Client;
exports.Auth0Client = Auth0Client = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], Auth0Client);
//# sourceMappingURL=auth0.client.js.map