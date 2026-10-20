import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TransactionFilter, TransactionRepository } from '../application/transaction.repository';
import { Transaction } from '../domain/transaction';
import { toTransaction } from './transaction-row.mapper';

@Injectable()
export class PrismaTransactionRepository extends TransactionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByClub(clubId: number, { types, playerId }: TransactionFilter): Promise<Transaction[]> {
    const rows = await this.prisma.transaction.findMany({
      where: { clubId, playerId, type: types === undefined ? undefined : { in: [...types] } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return rows.map(toTransaction);
  }
}
