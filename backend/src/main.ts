import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';

// Polyfill for crypto.randomUUID() (Node.js 18 doesn't have global crypto)
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = require('crypto');
}
if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = () => require('crypto').randomBytes(16).toString('hex');
}
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuditInterceptor } from './audit/interceptors/audit.interceptor';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  // Cookie parser for httpOnly cookie handling
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global audit interceptor
  const rabbitMQService = app.get(RabbitMQService);
  app.useGlobalInterceptors(new AuditInterceptor(rabbitMQService));

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('MRRM API')
    .setDescription('Medical Patient Relationship Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('organizations', 'Organization management')
    .addTag('patients', 'Patient management')
    .addTag('demands', 'Demand management')
    .addTag('paths', 'Treatment path management')
    .addTag('touchpoints', 'Touchpoint records')
    .addTag('followups', 'Follow-up management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`MRRM Backend running on port ${port}`, 'Bootstrap');
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
