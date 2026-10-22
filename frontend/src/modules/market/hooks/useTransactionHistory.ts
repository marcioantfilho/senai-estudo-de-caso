import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import { listClubTransactions, type TransactionFilter, type TransactionHistory } from '../api/market-api'

type TransactionHistoryState =
  | { status: 'loading' }
  | { status: 'ready'; history: TransactionHistory }
  | { status: 'error'; message: string }

/** `GET /clubs/{id}/transactions` com os filtros da tela; a resposta mais recente vence. */
export function useTransactionHistory(clubId: number, filter: TransactionFilter) {
  const [state, setState] = useState<TransactionHistoryState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const filterKey = JSON.stringify(filter)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    listClubTransactions(clubId, JSON.parse(filterKey) as TransactionFilter, controller.signal)
      .then((history) => setState({ status: 'ready', history }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', message: error instanceof ApiError ? error.message : String(error) })
        }
      })
    return () => controller.abort()
  }, [clubId, filterKey, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { state, reload }
}
