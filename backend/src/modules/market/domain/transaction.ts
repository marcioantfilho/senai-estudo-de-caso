import { PurchaseQuote } from './purchase';
import { SaleSettlement } from './sale';

export const TRANSACTION_TYPES = ['COMPRA', 'VENDA'] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/** RN17: valores e nome do momento da operação; nunca recalculados. */
export interface TransactionRecord {
  clubId: number;
  playerId: number;
  playerName: string;
  type: TransactionType;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cashChange: number;
  createdAt: Date;
}

export interface Transaction extends TransactionRecord {
  id: number;
}

interface TransactionParty {
  clubId: number;
  playerId: number;
  playerName: string;
}

/** Compra: multa 0,00, lucro nulo e variação do caixa −(valor + taxa). */
export function purchaseTransaction(party: TransactionParty, quote: PurchaseQuote, at: Date): TransactionRecord {
  return {
    ...party,
    type: 'COMPRA',
    value: quote.value,
    fee: quote.fee,
    penalty: 0,
    profit: null,
    cashChange: -quote.totalCost,
    createdAt: at,
  };
}

/** Venda: taxa é a comissão, e a variação do caixa é o crédito (valor − multa − comissão). */
export function saleTransaction(party: TransactionParty, settlement: SaleSettlement, at: Date): TransactionRecord {
  return {
    ...party,
    type: 'VENDA',
    value: settlement.saleValue,
    fee: settlement.commission,
    penalty: settlement.penalty,
    profit: settlement.profit,
    cashChange: settlement.credit,
    createdAt: at,
  };
}
