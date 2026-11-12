import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const DEFAULT_PORT = 4000;
const DEFAULT_WEB_ORIGIN = 'http://localhost:3000';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // The Next.js frontend runs on a different origin, so allow it explicitly.
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? DEFAULT_WEB_ORIGIN });

  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}
await bootstrap();
