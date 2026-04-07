import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
export declare class AuditInterceptor implements NestInterceptor {
    private readonly rabbitmq;
    private readonly logger;
    private readonly SKIP_PATHS;
    constructor(rabbitmq: RabbitMQService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private shouldSkip;
    private buildAuditData;
    private getAction;
    private getEntityType;
    private capitalize;
    private getEntityId;
    private getClientIP;
    private sanitizeBody;
    private publishAuditLog;
}
