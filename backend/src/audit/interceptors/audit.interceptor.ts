import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { AuthContext } from '../../common/auth/auth-context';
import { AuditLogDto } from '../audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditInterceptor');

  // Paths that should not be audited
  private readonly SKIP_PATHS = [
    '/health',
    '/metrics',
    '/api/docs',
    '/api/v1/auth/refresh',
    '/api/v1/auth/login',
  ];

  constructor(private readonly rabbitmq: RabbitMQService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip audit for certain paths
    if (this.shouldSkip(request.path)) {
      return next.handle();
    }

    const auditData = this.buildAuditData(request);

    return next.handle().pipe(
      tap((response) => {
        auditData.responseStatus = 200;
        this.publishAuditLog(auditData);
      }),
      catchError((error) => {
        auditData.responseStatus = error.status || 500;
        auditData.errorMessage = error.message;
        this.publishAuditLog(auditData);
        throw error;
      }),
    );
  }

  private shouldSkip(path: string): boolean {
    return this.SKIP_PATHS.some((p) => path.startsWith(p));
  }

  private buildAuditData(request: Request): AuditLogDto {
    const user = AuthContext.current();
    return {
      userId: user?.userId || undefined,
      orgId: user?.orgId || 'unknown',
      action: this.getAction(request.method),
      entityType: this.getEntityType(request.path),
      entityId: this.getEntityId(request),
      ipAddress: this.getClientIP(request),
      userAgent: request.headers['user-agent'],
      requestBody: this.sanitizeBody(request.body as Record<string, unknown>),
      requestMethod: request.method,
      requestPath: request.path,
    } as AuditLogDto & { requestMethod?: string; requestPath?: string };
  }

  private getAction(method: string): string {
    const actions: Record<string, string> = {
      GET: 'READ',
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return actions[method] || 'UNKNOWN';
  }

  private getEntityType(path: string): string {
    // Extract entity type from path like /api/v1/patients -> Patient
    const parts = path.split('/').filter(Boolean);
    if (parts.length < 2) return 'Unknown';

    // Skip version prefix (api/v1)
    const pathParts = parts.slice(2);
    if (pathParts.length === 0) return 'Unknown';

    const entityName = pathParts[0];
    // Singularize common entity names
    const singularMap: Record<string, string> = {
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

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/s$/, '');
  }

  private getEntityId(request: Request): string | undefined {
    const id = request.params.id;
    if (!id) return undefined;
    return Array.isArray(id) ? id[0] : id;
  }

  private getClientIP(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  private sanitizeBody(body: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
    if (!body) return undefined;

    const sanitized: Record<string, unknown> = { ...body };
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

  private publishAuditLog(log: AuditLogDto): void {
    try {
      this.rabbitmq.publishAuditLog(log);
    } catch (error) {
      // Never let audit logging break the request
      this.logger.error('Failed to publish audit log', error instanceof Error ? error.stack : String(error));
    }
  }
}
