import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: process.env.CORS_ORIGIN?.split(',') ?? true },
  });
  await app.listen(Number(process.env.PORT ?? 4001));
}
bootstrap();
