import { Module } from '@nestjs/common';
import { ClubPersistenceModule } from '../clubs/infrastructure/club-persistence.module';
import { PlayersModule } from '../players/players.module';
import { BuyPlayerUseCase } from './application/buy-player.use-case';
import { ContractRepository } from './application/contract.repository';
import { ListClubTransactionsUseCase } from './application/list-club-transactions.use-case';
import { MarketRepository } from './application/market.repository';
import { SellPlayerUseCase } from './application/sell-player.use-case';
import { TransactionRepository } from './application/transaction.repository';
import { ClubTransactionsController } from './http/club-transactions.controller';
import { MarketController } from './http/market.controller';
import { PrismaContractRepository } from './infrastructure/prisma-contract.repository';
import { PrismaMarketRepository } from './infrastructure/prisma-market.repository';
import { PrismaTransactionRepository } from './infrastructure/prisma-transaction.repository';

@Module({
  imports: [ClubPersistenceModule, PlayersModule],
  controllers: [MarketController, ClubTransactionsController],
  providers: [
    { provide: ContractRepository, useClass: PrismaContractRepository },
    { provide: MarketRepository, useClass: PrismaMarketRepository },
    { provide: TransactionRepository, useClass: PrismaTransactionRepository },
    BuyPlayerUseCase,
    SellPlayerUseCase,
    ListClubTransactionsUseCase,
  ],
  exports: [ContractRepository],
})
export class MarketModule {}
