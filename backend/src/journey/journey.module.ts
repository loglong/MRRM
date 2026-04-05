import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { JourneyService } from './journey.service';
import { JourneyController } from './journey.controller';

@Module({
  imports: [PrismaModule],
  controllers: [JourneyController],
  providers: [JourneyService],
  exports: [JourneyService],
})
export class JourneyModule {}
