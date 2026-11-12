import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { createValidationPipe } from './common/validation.js';

const DEFAULT_PORT = 4000;
const DEFAULT_WEB_ORIGIN = 'http://localhost:3000';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(createValidationPipe());

  // The Next.js frontend runs on a different origin, so allow it explicitly.
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? DEFAULT_WEB_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}
await bootstrap();
