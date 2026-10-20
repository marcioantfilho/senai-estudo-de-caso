import { Module } from '@nestjs/common';
import { ContractRepository } from './application/contract.repository';
import { PrismaContractRepository } from './infrastructure/prisma-contract.repository';

@Module({
  providers: [{ provide: ContractRepository, useClass: PrismaContractRepository }],
  exports: [ContractRepository],
})
export class MarketModule {}
