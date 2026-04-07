"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const audit_interceptor_1 = require("./audit/interceptors/audit.interceptor");
const rabbitmq_service_1 = require("./rabbitmq/rabbitmq.service");
async function bootstrap() {
    const logger = new common_1.Logger();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const rabbitMQService = app.get(rabbitmq_service_1.RabbitMQService);
    app.useGlobalInterceptors(new audit_interceptor_1.AuditInterceptor(rabbitMQService));
    app.setGlobalPrefix('api/v1', {
        exclude: ['health'],
    });
    const config = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
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
//# sourceMappingURL=main.js.map