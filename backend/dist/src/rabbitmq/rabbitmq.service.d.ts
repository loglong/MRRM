import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditLogDto } from '../audit/audit.service';
export declare class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private connection;
    private channel;
    private readonly AUDIT_QUEUE;
    private readonly AUDIT_EXCHANGE;
    private readonly AUDIT_ROUTING_KEY;
    private readonly logger;
    private buffer;
    private readonly MAX_BUFFER_SIZE;
    private isConnected;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private connect;
    private scheduleReconnect;
    private flushBuffer;
    publishAuditLog(log: AuditLogDto): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
