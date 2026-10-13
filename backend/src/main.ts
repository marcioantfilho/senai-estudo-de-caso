import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadAppConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  const config = loadAppConfig();
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: config.frontendOrigin });
  app.enableShutdownHooks();

  await app.listen(config.port);
}

void bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Falha ao iniciar o backend.';
  Logger.error(message, undefined, 'Bootstrap');
  process.exitCode = 1;
});
