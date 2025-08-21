import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') ?? true,
      credentials: true,
    },
  });
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();
