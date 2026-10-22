import type { TransactionType } from './api/market-api'

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  COMPRA: 'Compra',
  VENDA: 'Venda',
}
