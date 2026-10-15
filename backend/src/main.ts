import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { loadAppConfig } from './config/app.config';
import { ApiExceptionFilter } from './shared/http/api-exception.filter';

async function bootstrap(): Promise<void> {
  const config = loadAppConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });

  app.useBodyParser('text', { type: () => true });
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableCors({ origin: config.frontendOrigin });
  app.enableShutdownHooks();

  await app.listen(config.port);
}

void bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Falha ao iniciar o backend.';
  Logger.error(message, undefined, 'Bootstrap');
  process.exitCode = 1;
});
