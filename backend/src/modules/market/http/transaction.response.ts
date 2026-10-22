import { formatBrasiliaDateTime } from '../../../shared/http/brasilia-date-time';
import { PurchaseResult } from '../application/buy-player.use-case';
import { ClubTransactionHistory } from '../application/list-club-transactions.use-case';
import { SaleResult } from '../application/sell-player.use-case';
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
  total_cost: number;
  contract: { purchase_value: number; loyalty_until: string; status: string };
  club_cash: number;
}

export interface SaleResponse extends TransactionResponse {
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: string;
  club_cash: number;
}

export interface TransactionHistoryResponse {
  data: TransactionResponse[];
  summary: {
    total_spent: number;
    total_received: number;
    total_fees: number;
    total_penalties: number;
    total_profit: number;
  };
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

/** Formato de `POST /players/{id}/buy` (2.3.1), com o campo adicional `total_cost` (valor + taxa, RN13). */
export function toPurchaseResponse({ transaction, contract, clubCash, totalCost }: PurchaseResult): PurchaseResponse {
  return {
    ...toTransactionResponse(transaction),
    total_cost: totalCost,
    contract: {
      purchase_value: contract.purchaseValue,
      loyalty_until: formatBrasiliaDateTime(contract.loyaltyUntil),
      status: contract.status,
    },
    club_cash: clubCash,
  };
}

/** Formato de `GET /clubs/{id}/transactions` (2.3.3). */
export function toTransactionHistoryResponse({ data, summary }: ClubTransactionHistory): TransactionHistoryResponse {
  return {
    data: data.map(toTransactionResponse),
    summary: {
      total_spent: summary.totalSpent,
      total_received: summary.totalReceived,
      total_fees: summary.totalFees,
      total_penalties: summary.totalPenalties,
      total_profit: summary.totalProfit,
    },
  };
}

/** Formato de `POST /players/{id}/sell` (2.3.2); o crédito no caixa é o `cash_change`. */
export function toSaleResponse({ transaction, settlement, clubCash }: SaleResult): SaleResponse {
  return {
    ...toTransactionResponse(transaction),
    purchase_value: settlement.purchaseValue,
    remaining_days: settlement.remainingDays,
    penalty_rate: settlement.penaltyRate,
    contract_status: settlement.contractStatus,
    club_cash: clubCash,
  };
}
