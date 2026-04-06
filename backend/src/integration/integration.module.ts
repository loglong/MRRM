import { Module } from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { HisAdapterService } from './services/his-adapter.service';
import { CrmAdapterService } from './services/crm-adapter.service';
import { BiAdapterService } from './services/bi-adapter.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PatientsModule } from '../patients/patients.module';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [PrismaModule, PatientsModule, HealthModule],
  controllers: [IntegrationController, WebhookController],
  providers: [WebhookService, HisAdapterService, CrmAdapterService, BiAdapterService],
  exports: [WebhookService, HisAdapterService, CrmAdapterService, BiAdapterService],
})
export class IntegrationModule {}
