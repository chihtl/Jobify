import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS configuration
  app.enableCors({
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

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

  // Security middleware (disabled in development)
  if (configService.get<boolean>('app.enableHelmet')) {
    app.use(helmet());
  }

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Jobify API')
    .setDescription('Job portal backend API similar to ITViec')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Companies', 'Company management endpoints')
    .addTag('Categories', 'Job category endpoints')
    .addTag('Skills', 'Skill management endpoints')
    .addTag('Job Posts', 'Job posting endpoints')
    .addTag('Applications', 'Job application endpoints')
    .addTag('Saved Jobs', 'Saved job endpoints')
    .addTag('Admins', 'Admin management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔧 Environment: ${configService.get<string>('app.nodeEnv')}`);
  console.log(`🔐 Authentication: ${configService.get<boolean>('app.enableAuth') ? 'Enabled' : 'Disabled (Development)'}`);
}
bootstrap();
