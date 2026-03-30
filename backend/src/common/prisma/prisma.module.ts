import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantMiddleware } from '../../prisma/middleware/tenant.middleware';

@Global()
@Module({
  providers: [PrismaService, TenantMiddleware],
  exports: [PrismaService],
})
export class PrismaModule {}
