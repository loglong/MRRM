import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class AuditConsumer implements OnModuleInit {
    private prisma;
    private configService;
    private connection;
    private channel;
    private readonly AUDIT_QUEUE;
    private readonly logger;
    private consumerTag;
    constructor(prisma: PrismaService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private startConsuming;
    onModuleDestroy(): Promise<void>;
}
