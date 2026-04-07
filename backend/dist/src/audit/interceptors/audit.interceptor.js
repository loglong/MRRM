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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const rabbitmq_service_1 = require("../../rabbitmq/rabbitmq.service");
const auth_context_1 = require("../../common/auth/auth-context");
let AuditInterceptor = class AuditInterceptor {
    constructor(rabbitmq) {
        this.rabbitmq = rabbitmq;
        this.logger = new common_1.Logger('AuditInterceptor');
        this.SKIP_PATHS = [
            '/health',
            '/metrics',
            '/api/docs',
            '/api/v1/auth/refresh',
            '/api/v1/auth/login',
        ];
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        if (this.shouldSkip(request.path)) {
            return next.handle();
        }
        const auditData = this.buildAuditData(request);
        return next.handle().pipe((0, operators_1.tap)((response) => {
            auditData.responseStatus = 200;
            this.publishAuditLog(auditData);
        }), (0, operators_1.catchError)((error) => {
            auditData.responseStatus = error.status || 500;
            auditData.errorMessage = error.message;
            this.publishAuditLog(auditData);
            throw error;
        }));
    }
    shouldSkip(path) {
        return this.SKIP_PATHS.some((p) => path.startsWith(p));
    }
    buildAuditData(request) {
        const user = auth_context_1.AuthContext.current();
        return {
            userId: user?.userId || undefined,
            orgId: user?.orgId || 'unknown',
            action: this.getAction(request.method),
            entityType: this.getEntityType(request.path),
            entityId: this.getEntityId(request),
            ipAddress: this.getClientIP(request),
            userAgent: request.headers['user-agent'],
            requestBody: this.sanitizeBody(request.body),
            requestMethod: request.method,
            requestPath: request.path,
        };
    }
    getAction(method) {
        const actions = {
            GET: 'READ',
            POST: 'CREATE',
            PUT: 'UPDATE',
            PATCH: 'UPDATE',
            DELETE: 'DELETE',
        };
        return actions[method] || 'UNKNOWN';
    }
    getEntityType(path) {
        const parts = path.split('/').filter(Boolean);
        if (parts.length < 2)
            return 'Unknown';
        const pathParts = parts.slice(2);
        if (pathParts.length === 0)
            return 'Unknown';
        const entityName = pathParts[0];
        const singularMap = {
            patients: 'Patient',
            demands: 'Demand',
            users: 'User',
            organizations: 'Organization',
            roles: 'Role',
            permissions: 'Permission',
            paths: 'Path',
            touchpoints: 'Touchpoint',
            followups: 'Followup',
            audit: 'AuditLog',
        };
        return singularMap[entityName] || this.capitalize(entityName);
    }
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/s$/, '');
    }
    getEntityId(request) {
        const id = request.params.id;
        if (!id)
            return undefined;
        return Array.isArray(id) ? id[0] : id;
    }
    getClientIP(request) {
        return (request.headers['x-forwarded-for']?.split(',')[0] ||
            request.socket?.remoteAddress ||
            request.ip ||
            'unknown');
    }
    sanitizeBody(body) {
        if (!body)
            return undefined;
        const sanitized = { ...body };
        const sensitiveFields = [
            'password',
            'passwordHash',
            'currentPassword',
            'newPassword',
            'token',
            'refreshToken',
            'secret',
            'apiKey',
            'privateKey',
        ];
        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '[REDACTED]';
            }
        }
        return sanitized;
    }
    publishAuditLog(log) {
        try {
            this.rabbitmq.publishAuditLog(log);
        }
        catch (error) {
            this.logger.error('Failed to publish audit log', error instanceof Error ? error.stack : String(error));
        }
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map