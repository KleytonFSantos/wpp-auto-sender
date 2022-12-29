import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (process.env.APP_ENV !== 'production') {
    app.enableCors({
      allowedHeaders: '*',
      origin: '*',
      credentials: true,
    });
  } else {
    app.enableCors({
      origin: process.env.FE_URL,
      credentials: true,
    });
  }
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(8001);
}
bootstrap();
