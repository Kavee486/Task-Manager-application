import { ValidationPipe } from '@nestjs/common';

/**
 * Shared validation setup, used by main.ts and by the e2e tests so both
 * behave the same way.
 * - whitelist + forbidNonWhitelisted: unknown properties are rejected (400)
 * - transform: payloads become DTO instances and query/path values are coerced
 */
export const createValidationPipe = () =>
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
