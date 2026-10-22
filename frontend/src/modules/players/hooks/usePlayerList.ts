import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import { listPlayers, type PlayerListQuery, type PlayerPage } from '../api/players-api'

type PlayerListState =
  | { status: 'loading'; page: PlayerPage | null }
  | { status: 'ready'; page: PlayerPage }
  | { status: 'error'; page: null; message: string }

/** `GET /players` com a busca, os filtros, a ordem e a página da tela; a resposta mais recente vence. */
export function usePlayerList(query: PlayerListQuery) {
  const [state, setState] = useState<PlayerListState>({ status: 'loading', page: null })
  const [reloadKey, setReloadKey] = useState(0)
  const queryKey = JSON.stringify(query)

  useEffect(() => {
    const controller = new AbortController()
    setState((current) => ({ status: 'loading', page: current.page }))
    listPlayers(JSON.parse(queryKey) as PlayerListQuery, controller.signal)
      .then((page) => setState({ status: 'ready', page }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', page: null, message: error instanceof ApiError ? error.message : String(error) })
        }
      })
    return () => controller.abort()
  }, [queryKey, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { state, reload }
}
