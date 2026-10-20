import { formatBrasiliaDateTime } from '../../../shared/http/brasilia-date-time';
import { PurchaseResult } from '../application/buy-player.use-case';
import { Transaction } from '../domain/transaction';

/** Campos da transação (RN17), em snake_case. */
export interface TransactionResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: string;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

export interface PurchaseResponse extends TransactionResponse {
  contract: { purchase_value: number; loyalty_until: string; status: string };
  club_cash: number;
}

export function toTransactionResponse(transaction: Transaction): TransactionResponse {
  return {
    id: transaction.id,
    club_id: transaction.clubId,
    player_id: transaction.playerId,
    player_name: transaction.playerName,
    type: transaction.type,
    value: transaction.value,
    fee: transaction.fee,
    penalty: transaction.penalty,
    profit: transaction.profit,
    cash_change: transaction.cashChange,
    created_at: formatBrasiliaDateTime(transaction.createdAt),
  };
}

/** Formato de `POST /players/{id}/buy` (2.3.1). */
export function toPurchaseResponse({ transaction, contract, clubCash }: PurchaseResult): PurchaseResponse {
  return {
    ...toTransactionResponse(transaction),
    contract: {
      purchase_value: contract.purchaseValue,
      loyalty_until: formatBrasiliaDateTime(contract.loyaltyUntil),
      status: contract.status,
    },
    club_cash: clubCash,
  };
}
