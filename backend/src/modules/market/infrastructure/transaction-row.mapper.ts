import { Transaction as TransactionRow } from '@prisma/client';
import { Transaction, TransactionType } from '../domain/transaction';

export function toTransaction(row: TransactionRow): Transaction {
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
