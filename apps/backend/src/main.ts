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

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} 환경변수가 필요합니다.`);
  }
  return value;
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const frontendUrl = getRequiredEnv('FRONTEND_URL');
  const cookieSecret = getRequiredEnv('COOKIE_SECRET');
  const backendPort = Number(getRequiredEnv('BACKEND_PORT'));

  // CORS 설정
  await app.register(fastifyCors, {
    origin: [frontendUrl],
    credentials: true,
  });

  // Cookie 설정
  await app.register(fastifyCookie, {
    secret: cookieSecret,
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

  // Swagger 설정 (Fastify에서 @fastify/static 미설치 시 앱 부팅이 중단되지 않도록 보호)
  if (process.env.ENABLE_SWAGGER_UI === 'true') {
    try {
      const config = new DocumentBuilder()
        .setTitle('Roomie API')
        .setDescription('회의실 예약 SaaS API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `Swagger UI를 비활성화합니다. (@fastify/static 미설치 가능성) ${message}`,
      );
    }
  }

  await app.listen(backendPort, '0.0.0.0');
  console.log(`Server running on http://localhost:${backendPort}`);
  if (process.env.ENABLE_SWAGGER_UI === 'true') {
    console.log(`Swagger docs: http://localhost:${backendPort}/docs`);
  }
}

bootstrap();
