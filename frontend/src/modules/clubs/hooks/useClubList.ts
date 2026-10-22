import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import { listClubs, type Club, type ClubSort } from '../api/clubs-api'

type ClubListState =
  | { status: 'loading' }
  | { status: 'ready'; clubs: Club[] }
  | { status: 'error'; message: string }

/** `GET /clubs` na ordem escolhida; a lista vem na ordem devolvida pela API. */
export function useClubList(sort: ClubSort) {
  const [state, setState] = useState<ClubListState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    listClubs(sort, controller.signal)
      .then((clubs) => setState({ status: 'ready', clubs }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', message: error instanceof ApiError ? error.message : String(error) })
        }
      })
    return () => controller.abort()
  }, [sort, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { state, reload }
}
