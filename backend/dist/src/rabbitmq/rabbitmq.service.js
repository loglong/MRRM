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
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
let RabbitMQService = class RabbitMQService {
    constructor(configService) {
        this.configService = configService;
        this.connection = null;
        this.channel = null;
        this.AUDIT_QUEUE = 'audit.logs';
        this.AUDIT_EXCHANGE = 'audit.exchange';
        this.AUDIT_ROUTING_KEY = 'audit.log';
        this.logger = new common_1.Logger('RabbitMQService');
        this.buffer = [];
        this.MAX_BUFFER_SIZE = 100;
        this.isConnected = false;
    }
    async onModuleInit() {
        await this.connect();
    }
    async connect() {
        const url = this.configService.get('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
        try {
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(this.AUDIT_EXCHANGE, 'direct', { durable: true });
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
            await this.channel.bindQueue(this.AUDIT_QUEUE, this.AUDIT_EXCHANGE, this.AUDIT_ROUTING_KEY);
            this.connection.on('error', (err) => {
                this.logger.error('RabbitMQ connection error', err instanceof Error ? err.stack : String(err));
                this.isConnected = false;
                this.scheduleReconnect();
            });
            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed');
                this.isConnected = false;
                this.scheduleReconnect();
            });
            this.isConnected = true;
            this.logger.log('RabbitMQ connected successfully');
            await this.flushBuffer();
        }
        catch (error) {
            this.logger.error('Failed to connect to RabbitMQ', error instanceof Error ? error.stack : String(error));
            this.isConnected = false;
            this.scheduleReconnect();
        }
    }
    scheduleReconnect() {
        setTimeout(() => {
            this.logger.log('Attempting RabbitMQ reconnection...');
            this.connect();
        }, 5000);
    }
    async flushBuffer() {
        if (this.buffer.length === 0 || !this.isConnected)
            return;
        this.logger.log(`Flushing ${this.buffer.length} buffered audit logs`);
        const logsToFlush = [...this.buffer];
        this.buffer = [];
        for (const log of logsToFlush) {
            try {
                await this.publishAuditLog(log);
            }
            catch {
                this.buffer.push(log);
                break;
            }
        }
    }
    async publishAuditLog(log) {
        if (!this.isConnected || !this.channel) {
            if (this.buffer.length < this.MAX_BUFFER_SIZE) {
                this.buffer.push(log);
                this.logger.warn(`RabbitMQ unavailable, buffered audit log (${this.buffer.length}/${this.MAX_BUFFER_SIZE})`);
            }
            else {
                this.logger.error('RabbitMQ buffer full, audit log may be lost');
            }
            return;
        }
        const message = Buffer.from(JSON.stringify(log));
        this.channel.publish(this.AUDIT_EXCHANGE, this.AUDIT_ROUTING_KEY, message, {
            persistent: true,
            contentType: 'application/json',
        });
    }
    async onModuleDestroy() {
        try {
            if (this.channel)
                await this.channel.close();
            if (this.connection)
                await this.connection.close();
            this.logger.log('RabbitMQ connection closed');
        }
        catch (error) {
            this.logger.error('Error closing RabbitMQ connection', error instanceof Error ? error.stack : String(error));
        }
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RabbitMQService);
//# sourceMappingURL=rabbitmq.service.js.map