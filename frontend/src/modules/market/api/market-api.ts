import { apiDownload, apiRequest } from '../../../shared/api/http-client'

/** Corpo de `POST /players/{id}/buy` (2.3.1); `loyalty_until` no formato da RN01. */
export type PurchaseOrder = {
  club_id: number
  loyalty_until: string
}

/** Formato de `POST /players/{id}/buy` (2.3.1), com o campo adicional `total_cost` (valor + taxa). */
export type Purchase = {
  id: number
  club_id: number
  player_id: number
  player_name: string
  type: 'COMPRA'
  value: number
  fee: number
  penalty: number
  profit: null
  cash_change: number
  created_at: string
  total_cost: number
  contract: { purchase_value: number; loyalty_until: string; status: string }
  club_cash: number
}

export function buyPlayer(playerId: number, order: PurchaseOrder): Promise<Purchase> {
  return apiRequest<Purchase>(`/players/${playerId}/buy`, { method: 'POST', body: order })
}

/** Formato de `POST /players/{id}/sell` (2.3.2); `cash_change` é o crédito no caixa. */
export type Sale = {
  id: number
  club_id: number
  player_id: number
  player_name: string
  type: 'VENDA'
  value: number
  fee: number
  penalty: number
  profit: number
  cash_change: number
  created_at: string
  purchase_value: number
  remaining_days: number
  penalty_rate: number
  contract_status: string
  club_cash: number
}

/** A venda não tem corpo (2.3.2). */
export function sellPlayer(playerId: number): Promise<Sale> {
  return apiRequest<Sale>(`/players/${playerId}/sell`, { method: 'POST' })
}

export const TRANSACTION_TYPES = ['COMPRA', 'VENDA'] as const

export type TransactionType = (typeof TRANSACTION_TYPES)[number]

/** Campos da transação (RN17), gravados com o nome e os valores do momento. */
export type Transaction = {
  id: number
  club_id: number
  player_id: number
  player_name: string
  type: TransactionType
  value: number
  fee: number
  penalty: number
  profit: number | null
  cash_change: number
  created_at: string
}

/** Totais calculados pela API sobre as transações filtradas (RN17). */
export type TransactionSummary = {
  total_spent: number
  total_received: number
  total_fees: number
  total_penalties: number
  total_profit: number
}

/** Formato de `GET /clubs/{id}/transactions` (2.3.3). */
export type TransactionHistory = {
  data: Transaction[]
  summary: TransactionSummary
}

/** Filtros do histórico e da exportação: nenhum tipo marcado não filtra por tipo. */
export type TransactionFilter = {
  types: readonly TransactionType[]
  playerId?: number
}

function toTransactionQuery({ types, playerId }: TransactionFilter) {
  return {
    type: types.length > 0 ? TRANSACTION_TYPES.filter((type) => types.includes(type)).join(',') : undefined,
    player_id: playerId,
  }
}

export function listClubTransactions(clubId: number, filter: TransactionFilter, signal?: AbortSignal): Promise<TransactionHistory> {
  return apiRequest<TransactionHistory>(`/clubs/${clubId}/transactions`, { query: toTransactionQuery(filter), signal })
}

/** RN18: o CSV como a API devolve, com os mesmos filtros do histórico. */
export function exportClubTransactions(clubId: number, filter: TransactionFilter): Promise<Blob> {
  return apiDownload(`/clubs/${clubId}/transactions/export`, { query: toTransactionQuery(filter) })
}
