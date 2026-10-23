import { useCallback } from 'react'
import { useApiResource } from '../../../shared/hooks/useApiResource'
import { listClubTransactions, type TransactionFilter } from '../api/market-api'

/** `GET /clubs/{id}/transactions` com os filtros da tela (estado da tela, trocado a cada mudança de filtro). */
export function useTransactionHistory(clubId: number, filter: TransactionFilter) {
  return useApiResource(useCallback((signal: AbortSignal) => listClubTransactions(clubId, filter, signal), [clubId, filter]))
}
