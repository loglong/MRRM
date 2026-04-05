import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { AuditLogDto } from '../audit/audit.service';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly AUDIT_QUEUE = 'audit.logs';
  private readonly AUDIT_EXCHANGE = 'audit.exchange';
  private readonly AUDIT_ROUTING_KEY = 'audit.log';

  private readonly logger = new Logger('RabbitMQService');

  // In-memory buffer when RabbitMQ is unavailable
  private buffer: AuditLogDto[] = [];
  private readonly MAX_BUFFER_SIZE = 100;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Declare durable exchange and queue
      await this.channel.assertExchange(this.AUDIT_EXCHANGE, 'direct', { durable: true });
      // Delete queue if exists with wrong args, then recreate with correct ttl
      try {
        await this.channel.deleteQueue(this.AUDIT_QUEUE);
      } catch {
        // Queue may not exist, ignore
      }
      await this.channel.assertQueue(this.AUDIT_QUEUE, {
        durable: true,
        arguments: {
          'x-message-ttl': 31536000000, // 1 year in ms
        },
      });
      await this.channel.bindQueue(this.AUDIT_QUEUE, this.AUDIT_EXCHANGE, this.AUDIT_ROUTING_KEY);

      // Handle connection errors
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

      // Flush buffered messages
      await this.flushBuffer();
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error instanceof Error ? error.stack : String(error));
      this.isConnected = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    setTimeout(() => {
      this.logger.log('Attempting RabbitMQ reconnection...');
      this.connect();
    }, 5000);
  }

  private async flushBuffer() {
    if (this.buffer.length === 0 || !this.isConnected) return;

    this.logger.log(`Flushing ${this.buffer.length} buffered audit logs`);
    const logsToFlush = [...this.buffer];
    this.buffer = [];

    for (const log of logsToFlush) {
      try {
        await this.publishAuditLog(log);
      } catch {
        // If publish fails, put back in buffer
        this.buffer.push(log);
        break;
      }
    }
  }

  async publishAuditLog(log: AuditLogDto): Promise<void> {
    if (!this.isConnected || !this.channel) {
      // Buffer the log if RabbitMQ is unavailable
      if (this.buffer.length < this.MAX_BUFFER_SIZE) {
        this.buffer.push(log);
        this.logger.warn(`RabbitMQ unavailable, buffered audit log (${this.buffer.length}/${this.MAX_BUFFER_SIZE})`);
      } else {
        // Fallback: direct DB write would be handled by caller
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
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error instanceof Error ? error.stack : String(error));
    }
  }
}
