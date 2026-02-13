import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // CORS 설정
  await app.register(fastifyCors, {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  // Cookie 설정
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET ?? 'cookie-secret',
  });

  // 전역 Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API 접두사
  app.setGlobalPrefix('api/v1');

  // Swagger 설정 (Fastify static 패키지 설치 전까지 비활성화 가능)
  if (process.env.ENABLE_SWAGGER_UI === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Roomie API')
      .setDescription('회의실 예약 SaaS API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.BACKEND_PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on http://localhost:${port}`);
  if (process.env.ENABLE_SWAGGER_UI === 'true') {
    console.log(`Swagger docs: http://localhost:${port}/docs`);
  }
}

bootstrap();
