import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { loadDatabaseUrl } from '../../config/database.config';

/** Espera por uma conexão e duração de cada transação, abaixo dos 10 s por requisição. */
const TRANSACTION_OPTIONS = { maxWait: 5_000, timeout: 8_000 };

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ datasourceUrl: loadDatabaseUrl(), transactionOptions: TRANSACTION_OPTIONS });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch {
      throw new Error(
        'Não foi possível conectar ao PostgreSQL. Verifique DATABASE_URL e se o banco está ativo.',
      );
    }
    this.logger.log('Conexão com o PostgreSQL estabelecida.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
