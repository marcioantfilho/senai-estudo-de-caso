import { Module } from '@nestjs/common';
import { BuyPlayerUseCase } from './application/buy-player.use-case';
import { ContractRepository } from './application/contract.repository';
import { MarketRepository } from './application/market.repository';
import { SellPlayerUseCase } from './application/sell-player.use-case';
import { MarketController } from './http/market.controller';
import { PrismaContractRepository } from './infrastructure/prisma-contract.repository';
import { PrismaMarketRepository } from './infrastructure/prisma-market.repository';

@Module({
  controllers: [MarketController],
  providers: [
    { provide: ContractRepository, useClass: PrismaContractRepository },
    { provide: MarketRepository, useClass: PrismaMarketRepository },
    BuyPlayerUseCase,
    SellPlayerUseCase,
  ],
  exports: [ContractRepository],
})
export class MarketModule {}
