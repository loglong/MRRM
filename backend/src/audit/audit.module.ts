import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Module({
  controllers: [AuditController],
  providers: [AuditService, RabbitMQService],
  exports: [AuditService],
})
export class AuditModule {}
