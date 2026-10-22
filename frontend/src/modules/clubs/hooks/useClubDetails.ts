import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import { getClub, type ClubDetails } from '../api/clubs-api'

const NOT_FOUND = 404

type ClubDetailsState =
  | { status: 'loading' }
  | { status: 'ready'; club: ClubDetails }
  | { status: 'error'; message: string; notFound: boolean }

/** `GET /clubs/{id}`: caixa, valores e elenco com os contratos, como a API devolve. */
export function useClubDetails(clubId: number) {
  const [state, setState] = useState<ClubDetailsState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    getClub(clubId, controller.signal)
      .then((club) => setState({ status: 'ready', club }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            message: error instanceof ApiError ? error.message : String(error),
            notFound: error instanceof ApiError && error.status === NOT_FOUND,
          })
        }
      })
    return () => controller.abort()
  }, [clubId, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { state, reload }
}
