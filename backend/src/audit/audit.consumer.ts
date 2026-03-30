import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuditConsumer implements OnModuleInit {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly AUDIT_QUEUE = 'audit.logs';
  private readonly logger = new Logger('AuditConsumer');
  private consumerTag: string | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.startConsuming();
  }

  private async startConsuming() {
    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');

    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Ensure queue exists
      await this.channel.assertQueue(this.AUDIT_QUEUE, { durable: true });

      // Set prefetch to process one message at a time
      await this.channel.prefetch(1);

      // Start consuming
      const { consumerTag } = await this.channel.consume(
        this.AUDIT_QUEUE,
        async (msg) => {
          if (!msg) return;

          try {
            const log = JSON.parse(msg.content.toString());

            // Write to database with org context
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

            // Acknowledge successful processing
            this.channel?.ack(msg);
          } catch (error) {
            this.logger.error('Failed to process audit log message', error instanceof Error ? error.stack : String(error));
            // Negative ack - requeue the message for retry
            this.channel?.nack(msg, false, true);
          }
        },
        { noAck: false },
      );

      this.consumerTag = consumerTag;
      this.logger.log('Audit consumer started');

      // Handle connection errors
      this.connection.on('error', (err) => {
        this.logger.error('Audit consumer connection error', err instanceof Error ? err.stack : String(err));
      });

      this.connection.on('close', () => {
        this.logger.warn('Audit consumer connection closed, reconnecting...');
        setTimeout(() => this.startConsuming(), 5000);
      });
    } catch (error) {
      this.logger.error('Failed to start audit consumer', error instanceof Error ? error.stack : String(error));
      setTimeout(() => this.startConsuming(), 5000);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.consumerTag && this.channel) {
        await this.channel.cancel(this.consumerTag);
      }
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.log('Audit consumer stopped');
    } catch (error) {
      this.logger.error('Error stopping audit consumer', error instanceof Error ? error.stack : String(error));
    }
  }
}
