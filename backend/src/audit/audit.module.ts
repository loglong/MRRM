import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditConsumer } from './audit.consumer';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditConsumer, RabbitMQService],
  exports: [AuditService],
})
export class AuditModule {}
