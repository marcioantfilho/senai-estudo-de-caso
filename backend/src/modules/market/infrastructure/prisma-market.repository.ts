import { Injectable } from '@nestjs/common';
import { Transaction as TransactionRow } from '@prisma/client';
import { TransactionClient, TransactionRunner } from '../../../infrastructure/database/transaction-runner';
import { Club } from '../../clubs/domain/club';
import { toClub } from '../../clubs/infrastructure/club-row.mapper';
import { Player } from '../../players/domain/player';
import { toPlayer } from '../../players/infrastructure/player-row.mapper';
import { MarketRepository, MarketSession, PurchaseRecord } from '../application/market.repository';
import { Transaction, TransactionType } from '../domain/transaction';

const SALE_TYPE: TransactionType = 'VENDA';

@Injectable()
export class PrismaMarketRepository extends MarketRepository {
  constructor(private readonly transactions: TransactionRunner) {
    super();
  }

  inTransaction<T>(work: (session: MarketSession) => Promise<T>): Promise<T> {
    return this.transactions.run((client) => work(new PrismaMarketSession(client)));
  }
}

class PrismaMarketSession implements MarketSession {
  constructor(private readonly client: TransactionClient) {}

  async lockActivePlayer(id: number): Promise<Player | null> {
    await this.client.$queryRaw`SELECT id FROM jogadores WHERE id = ${id} FOR UPDATE`;
    const row = await this.client.player.findFirst({ where: { id, deletedAt: null } });
    return row === null ? null : toPlayer(row);
  }

  async lockClub(id: number): Promise<Club | null> {
    await this.client.$queryRaw`SELECT id FROM clubes WHERE id = ${id} FOR UPDATE`;
    const row = await this.client.club.findUnique({ where: { id } });
    return row === null ? null : toClub(row);
  }

  countSquad(clubId: number): Promise<number> {
    return this.client.player.count({ where: { clubId, deletedAt: null } });
  }

  async hasSold(clubId: number, playerId: number): Promise<boolean> {
    return (await this.client.transaction.count({ where: { clubId, playerId, type: SALE_TYPE } })) > 0;
  }

  async recordPurchase({ transaction, contract, clubCash }: PurchaseRecord): Promise<Transaction> {
    const { clubId, playerId, createdAt } = transaction;
    await this.client.club.update({ where: { id: clubId }, data: { cash: clubCash.toFixed(2) } });
    await this.client.player.update({ where: { id: playerId }, data: { clubId } });
    await this.client.contract.create({
      data: {
        playerId,
        clubId,
        purchaseValue: contract.purchaseValue.toFixed(2),
        loyaltyUntil: contract.loyaltyUntil,
        status: contract.status,
        startedAt: createdAt,
      },
    });
    const row = await this.client.transaction.create({
      data: {
        ...transaction,
        value: transaction.value.toFixed(2),
        fee: transaction.fee.toFixed(2),
        penalty: transaction.penalty.toFixed(2),
        profit: transaction.profit?.toFixed(2) ?? null,
        cashChange: transaction.cashChange.toFixed(2),
      },
    });
    return toTransaction(row);
  }
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    clubId: row.clubId,
    playerId: row.playerId,
    playerName: row.playerName,
    type: row.type as TransactionType,
    value: row.value.toNumber(),
    fee: row.fee.toNumber(),
    penalty: row.penalty.toNumber(),
    profit: row.profit?.toNumber() ?? null,
    cashChange: row.cashChange.toNumber(),
    createdAt: row.createdAt,
  };
}
