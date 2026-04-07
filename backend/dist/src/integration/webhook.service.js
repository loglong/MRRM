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
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
let WebhookService = class WebhookService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger('WebhookService');
        this.INTEGRATION_EXCHANGE = 'integration.exchange';
        this.MAX_BUFFER_SIZE = 100;
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
        this.buffer = [];
        this.webhookUrls = new Map();
    }
    async onModuleInit() {
        await this.connectIntegrationExchange();
    }
    async connectIntegrationExchange() {
        const url = this.configService.get('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
        try {
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(this.INTEGRATION_EXCHANGE, 'topic', {
                durable: true,
            });
            this.connection.on('error', (err) => {
                this.logger.error('RabbitMQ integration connection error', err instanceof Error ? err.stack : String(err));
                this.isConnected = false;
                this.scheduleReconnect();
            });
            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ integration connection closed');
                this.isConnected = false;
                this.scheduleReconnect();
            });
            this.isConnected = true;
            this.logger.log('RabbitMQ integration exchange connected');
            await this.flushBuffer();
        }
        catch (error) {
            this.logger.error('Failed to connect to RabbitMQ integration exchange', error instanceof Error ? error.stack : String(error));
            this.isConnected = false;
            this.scheduleReconnect();
        }
    }
    scheduleReconnect() {
        setTimeout(() => {
            this.logger.log('Attempting RabbitMQ integration reconnect...');
            this.connectIntegrationExchange();
        }, 5000);
    }
    async flushBuffer() {
        if (this.buffer.length === 0 || !this.isConnected || !this.channel)
            return;
        this.logger.log(`Flushing ${this.buffer.length} buffered webhook events`);
        const eventsToFlush = [...this.buffer];
        this.buffer = [];
        for (const event of eventsToFlush) {
            try {
                await this.publishToExchange(event);
            }
            catch {
                this.buffer.push(event);
                break;
            }
        }
    }
    async publishToExchange(payload) {
        if (!this.isConnected || !this.channel) {
            throw new Error('RabbitMQ not connected');
        }
        const routingKey = `webhook.${payload.eventType}`;
        const message = Buffer.from(JSON.stringify(payload));
        this.channel.publish(this.INTEGRATION_EXCHANGE, routingKey, message, {
            persistent: true,
            contentType: 'application/json',
        });
        this.logger.log(`Published webhook event: ${payload.eventType} with routing key: ${routingKey}`);
    }
    async dispatch(payload) {
        if (!this.isConnected || !this.channel) {
            if (this.buffer.length < this.MAX_BUFFER_SIZE) {
                this.buffer.push(payload);
                this.logger.warn(`RabbitMQ unavailable, buffered webhook event (${this.buffer.length}/${this.MAX_BUFFER_SIZE})`);
            }
            else {
                this.logger.error('Webhook buffer full, event may be lost');
            }
            return;
        }
        try {
            await this.publishToExchange(payload);
        }
        catch (error) {
            if (this.buffer.length < this.MAX_BUFFER_SIZE) {
                this.buffer.push(payload);
                this.logger.warn(`Failed to publish, buffered webhook event`);
            }
            else {
                this.logger.error('Webhook buffer full, event may be lost');
            }
        }
    }
    getIntegrationExchange() {
        return this.INTEGRATION_EXCHANGE;
    }
    getAvailableEventTypes() {
        return [
            'patient.created',
            'patient.updated',
            'demand.created',
            'demand.status_changed',
            'followup.completed',
            'touchpoint.created',
        ];
    }
    getWebhookUrls(eventType) {
        return this.webhookUrls.get(eventType) || [];
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map