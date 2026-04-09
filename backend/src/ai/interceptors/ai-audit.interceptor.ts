import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AiAuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { body } = request;

    // 从 ApiKeyGuard 获取的 AI Key 配置
    const aiKeyConfig = request['aiKeyConfig'];
    if (!aiKeyConfig) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.logAudit(request, aiKeyConfig, {
            status: 200,
            requestBody: body,
          });
        },
        error: (error) => {
          this.logAudit(request, aiKeyConfig, {
            status: error.status || 500,
            requestBody: body,
            errorMessage: error.message,
          });
        },
      })
    );
  }

  private async logAudit(
    request: any,
    aiKeyConfig: any,
    result: { status: number; requestBody?: any; errorMessage?: string }
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          orgId: aiKeyConfig.orgId,
          action: request.method,
          entityType: this.extractEntityType(request.url),
          entityId: this.extractEntityId(request.url),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          requestMethod: request.method,
          requestPath: request.url,
          requestBody: result.requestBody,
          responseStatus: result.status,
          errorMessage: result.errorMessage,
          apiKeyId: aiKeyConfig.id,
          isAiCall: true,
        },
      });
    } catch (error) {
      console.error('Failed to write AI audit log:', error);
    }
  }

  private extractEntityType(url: string): string {
    const path = url.split('?')[0];
    // 从 URL 提取实体类型
    if (path.includes('/patients/search')) return 'PatientSearch';
    if (path.includes('/patients/') && path.includes('/touchpoints')) return 'Touchpoint';
    if (path.includes('/patients/') && path.includes('/followups')) return 'Followup';
    if (path.match(/\/patients\/[^\/]+$/)) return 'Patient';
    if (path.includes('/patients')) return 'PatientList';
    if (path.includes('/health')) return 'Health';
    return 'Unknown';
  }

  private extractEntityId(url: string): string | undefined {
    const path = url.split('?')[0];
    // 从 URL 提取实体 ID - touchpoints 和 followups 的 ID 在实体类型之前
    const touchpointMatch = path.match(/\/patients\/([^\/]+)\/touchpoints/);
    if (touchpointMatch) return touchpointMatch[1];
    const followupMatch = path.match(/\/patients\/([^\/]+)\/followups/);
    if (followupMatch) return followupMatch[1];
    const patientMatch = path.match(/\/patients\/([^\/]+)/);
    return patientMatch?.[1];
  }
}