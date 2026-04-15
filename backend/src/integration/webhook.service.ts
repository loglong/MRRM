import { Body, Injectable, Logger, OnModuleInit, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import * as amqp from 'amqplib';

@Injectable()
export class WebhookService implements OnModuleInit {
  private readonly logger = new Logger('WebhookService');
  private readonly INTEGRATION_EXCHANGE = 'integration.exchange';
  private readonly MAX_BUFFER_SIZE = 100;

  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private isConnected = false;
  private buffer: WebhookPayloadDto[] = [];

  // Simple webhook URL registry (MVP: stored in memory/ConfigService)
  private webhookUrls: Map<string, string[]> = new Map();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.connectIntegrationExchange();
  }

  private async connectIntegrationExchange() {
    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Declare integration exchange (topic type for routing key patterns)
      await this.channel.assertExchange(this.INTEGRATION_EXCHANGE, 'topic', {
        durable: true,
      });

      // Handle connection errors
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

      // Flush buffered events
      await this.flushBuffer();
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ integration exchange', error instanceof Error ? error.stack : String(error));
      this.isConnected = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    setTimeout(() => {
      this.logger.log('Attempting RabbitMQ integration reconnect...');
      this.connectIntegrationExchange();
    }, 5000);
  }

  private async flushBuffer() {
    if (this.buffer.length === 0 || !this.isConnected || !this.channel) return;

    this.logger.log(`Flushing ${this.buffer.length} buffered webhook events`);
    const eventsToFlush = [...this.buffer];
    this.buffer = [];

    for (const event of eventsToFlush) {
      try {
        await this.publishToExchange(event);
      } catch {
        this.buffer.push(event);
        break;
      }
    }
  }

  private async publishToExchange(payload: WebhookPayloadDto): Promise<void> {
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

  /**
   * Dispatch a webhook event to the integration exchange.
   * If RabbitMQ is unavailable, buffer in memory (max 100 events).
   */
  async dispatch(payload: WebhookPayloadDto): Promise<void> {
    if (!this.isConnected || !this.channel) {
      if (this.buffer.length < this.MAX_BUFFER_SIZE) {
        this.buffer.push(payload);
        this.logger.warn(
          `RabbitMQ unavailable, buffered webhook event (${this.buffer.length}/${this.MAX_BUFFER_SIZE})`
        );
      } else {
        this.logger.error('Webhook buffer full, event may be lost');
      }
      return;
    }

    try {
      await this.publishToExchange(payload);
    } catch (error) {
      if (this.buffer.length < this.MAX_BUFFER_SIZE) {
        this.buffer.push(payload);
        this.logger.warn(`Failed to publish, buffered webhook event`);
      } else {
        this.logger.error('Webhook buffer full, event may be lost');
      }
    }
  }

  getIntegrationExchange(): string {
    return this.INTEGRATION_EXCHANGE;
  }

  /**
   * Get available event types for webhook subscriptions.
   */
  getAvailableEventTypes(): string[] {
    return [
      'patient.created',
      'patient.updated',
      'demand.created',
      'demand.status_changed',
      'followup.completed',
      'touchpoint.created',
    ];
  }

  /**
   * Get registered webhook URLs for an event type.
   */
  getWebhookUrls(eventType: string): string[] {
    return this.webhookUrls.get(eventType) || [];
  }

  @Post('his/patient')
  async syncHisPatient(@Body() data: {
    action: 'create' | 'update' | 'delete';
    patient: {
      patient_id: string;
      patient_name: string;
      mobile?: string;
      phone?: string;
      gender?: string;
      birthday?: string;
      last_visit_date?: string;
      consume_total?: number;
      order_count?: number;
      last_order_date?: string;
      vip_flag?: string;
      consume_level?: string;
    };
    timestamp: string;
  }) {
    const { action, patient } = data;

    if (action === 'delete') {
      await this.prisma.patient.update({
        where: { id: patient.patient_id },
        data: { deletedAt: new Date() },
      });
      return { received: true, action: 'deleted' };
    }

    const patientData: any = {
      id: patient.patient_id,
      name: patient.patient_name,
      phone: patient.mobile || patient.phone,
      gender: patient.gender ? patient.gender.toUpperCase() as any : null,
      birthDate: patient.birthday ? new Date(patient.birthday) : null,
      lastVisitAt: patient.last_visit_date ? new Date(patient.last_visit_date) : null,
      totalAmount: patient.consume_total || 0,
      orderCount: patient.order_count || 0,
      lastOrderAt: patient.last_order_date ? new Date(patient.last_order_date) : null,
    };

    if (action === 'create') {
      await this.prisma.patient.create({ data: patientData });
    } else {
      await this.prisma.patient.update({
        where: { id: patient.patient_id },
        data: patientData,
      });
    }

    return { received: true, action };
  }
}
