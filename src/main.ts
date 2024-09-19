import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { RedisIoAdapter } from './adapters/redis_io.adapter';
import { RedisService } from './redis/redis.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const redis = app.get(RedisService)
  await redis.init();

  app.enableCors({
    origin: configService.get<string>('ORIGIN'),
    credentials: true,
  });
  app.use(cookieParser(configService.get<string>('COOKIES_SECRET')));

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis(redis.getClient());
  app.useWebSocketAdapter(redisIoAdapter);

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.listen(3000);
}
bootstrap();
