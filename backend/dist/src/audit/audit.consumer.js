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
exports.AuditConsumer = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
const prisma_service_1 = require("../common/prisma/prisma.service");
let AuditConsumer = class AuditConsumer {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.connection = null;
        this.channel = null;
        this.AUDIT_QUEUE = 'audit.logs';
        this.logger = new common_1.Logger('AuditConsumer');
        this.consumerTag = null;
    }
    async onModuleInit() {
        await this.startConsuming();
    }
    async startConsuming() {
        const url = this.configService.get('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
        try {
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();
            try {
                await this.channel.deleteQueue(this.AUDIT_QUEUE);
            }
            catch {
            }
            await this.channel.assertQueue(this.AUDIT_QUEUE, {
                durable: true,
                arguments: {
                    'x-message-ttl': 31536000000,
                },
            });
            await this.channel.prefetch(1);
            const { consumerTag } = await this.channel.consume(this.AUDIT_QUEUE, async (msg) => {
                if (!msg)
                    return;
                try {
                    const log = JSON.parse(msg.content.toString());
                    await this.prisma.auditLog.create({
                        data: {
                            userId: log.userId,
                            orgId: log.orgId,
                            action: log.action,
                            entityType: log.entityType,
                            entityId: log.entityId,
                            ipAddress: log.ipAddress,
                            userAgent: log.userAgent,
                            requestMethod: log.requestMethod,
                            requestPath: log.requestPath,
                            requestBody: log.requestBody,
                            responseStatus: log.responseStatus,
                            errorMessage: log.errorMessage,
                        },
                    });
                    this.channel?.ack(msg);
                }
                catch (error) {
                    this.logger.error('Failed to process audit log message', error instanceof Error ? error.stack : String(error));
                    this.channel?.nack(msg, false, true);
                }
            }, { noAck: false });
            this.consumerTag = consumerTag;
            this.logger.log('Audit consumer started');
            this.connection.on('error', (err) => {
                this.logger.error('Audit consumer connection error', err instanceof Error ? err.stack : String(err));
            });
            this.connection.on('close', () => {
                this.logger.warn('Audit consumer connection closed, reconnecting...');
                setTimeout(() => this.startConsuming(), 5000);
            });
        }
        catch (error) {
            this.logger.error('Failed to start audit consumer', error instanceof Error ? error.stack : String(error));
            setTimeout(() => this.startConsuming(), 5000);
        }
    }
    async onModuleDestroy() {
        try {
            if (this.consumerTag && this.channel) {
                await this.channel.cancel(this.consumerTag);
            }
            if (this.channel)
                await this.channel.close();
            if (this.connection)
                await this.connection.close();
            this.logger.log('Audit consumer stopped');
        }
        catch (error) {
            this.logger.error('Error stopping audit consumer', error instanceof Error ? error.stack : String(error));
        }
    }
};
exports.AuditConsumer = AuditConsumer;
exports.AuditConsumer = AuditConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AuditConsumer);
//# sourceMappingURL=audit.consumer.js.map