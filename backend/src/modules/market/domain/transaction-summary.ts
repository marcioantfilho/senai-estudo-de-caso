import { sumMoney } from '../../../shared/domain/money';
import { Transaction } from './transaction';

export interface TransactionSummary {
  totalSpent: number;
  totalReceived: number;
  totalFees: number;
  totalPenalties: number;
  totalProfit: number;
}

/** RN17: totais das transações recebidas, já filtradas; sem transações, todos 0,00. */
export function summarizeTransactions(transactions: readonly Transaction[]): TransactionSummary {
  const purchases = transactions.filter(({ type }) => type === 'COMPRA');
  const sales = transactions.filter(({ type }) => type === 'VENDA');
  return {
    totalSpent: sumMoney(purchases.flatMap(({ value, fee }) => [value, fee])),
    totalReceived: sumMoney(sales.map(({ cashChange }) => cashChange)),
    totalFees: sumMoney(transactions.map(({ fee }) => fee)),
    totalPenalties: sumMoney(sales.map(({ penalty }) => penalty)),
    totalProfit: sumMoney(sales.map(({ profit }) => profit ?? 0)),
  };
}
