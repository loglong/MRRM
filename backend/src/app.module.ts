import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AuditModule } from './audit/audit.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { EncryptionModule } from './common/encryption/encryption.module';
import { PatientsModule } from './patients/patients.module';
import { DemandsModule } from './demands/demands.module';
import { PathsModule } from './paths/paths.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TouchpointsModule } from './touchpoints/touchpoints.module';
import { FollowupsModule } from './followups/followups.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { OrgIdMiddleware } from './common/middleware/org-id.middleware';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    EncryptionModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    AuditModule,
    PatientsModule,
    DemandsModule,
    PathsModule,
    NotificationsModule,
    TouchpointsModule,
    FollowupsModule,
    RabbitMQModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');

    // Apply org_id middleware for tenant isolation
    consumer
      .apply(OrgIdMiddleware)
      .exclude('/health', '/api/docs/(.*)', '/api/v1/auth/(.*)')
      .forRoutes('*');
  }
}
