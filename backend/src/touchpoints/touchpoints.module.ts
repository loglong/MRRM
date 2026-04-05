import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { TouchpointsService } from './touchpoints.service';
import { TouchpointsController } from './touchpoints.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TouchpointsController],
  providers: [TouchpointsService],
  exports: [TouchpointsService],
})
export class TouchpointsModule {}
