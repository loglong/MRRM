import { Module } from '@nestjs/common';
import { DemandsService } from './demands.service';
import { DemandsController, PatientDemandsController } from './demands.controller';

@Module({
  controllers: [DemandsController, PatientDemandsController],
  providers: [DemandsService],
  exports: [DemandsService],
})
export class DemandsModule {}
