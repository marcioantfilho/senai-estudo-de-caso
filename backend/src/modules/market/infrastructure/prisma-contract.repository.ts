import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ActiveContract, ContractRepository } from '../application/contract.repository';

const ACTIVE_STATUS = 'ATIVO';

@Injectable()
export class PrismaContractRepository extends ContractRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findActiveByClub(clubId: number): Promise<ActiveContract[]> {
    const rows = await this.prisma.contract.findMany({ where: { clubId, status: ACTIVE_STATUS } });
    return rows.map((row) => ({
      playerId: row.playerId,
      purchaseValue: row.purchaseValue.toNumber(),
      loyaltyUntil: row.loyaltyUntil,
    }));
  }
}
