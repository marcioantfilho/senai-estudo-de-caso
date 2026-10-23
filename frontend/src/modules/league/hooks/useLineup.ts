import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import { getLineup, type Lineup } from '../api/lineup-api'

type LineupState =
  | { status: 'loading' }
  | { status: 'ready'; lineup: Lineup }
  | { status: 'error'; message: string }

/** `GET /clubs/{id}/lineup`; `show` troca pela escalação devolvida pelo `PUT`, sem montá-la na tela. */
export function useLineup(clubId: number) {
  const [state, setState] = useState<LineupState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    getLineup(clubId, controller.signal)
      .then((lineup) => setState({ status: 'ready', lineup }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', message: error instanceof ApiError ? error.message : String(error) })
        }
      })
    return () => controller.abort()
  }, [clubId, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])
  const show = useCallback((lineup: Lineup) => setState({ status: 'ready', lineup }), [])

  return { state, reload, show }
}
