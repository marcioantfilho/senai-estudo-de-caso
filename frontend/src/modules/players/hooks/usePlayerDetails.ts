import { useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import { getPlayer, type Player } from '../api/players-api'

type PlayerDetailsState =
  | { status: 'loading' }
  | { status: 'ready'; player: Player }
  | { status: 'error'; message: string }

/** `GET /players/{id}`, buscado de novo a cada `version` (depois de uma ação no jogador). */
export function usePlayerDetails(playerId: number, version: number) {
  const [state, setState] = useState<PlayerDetailsState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    getPlayer(playerId, controller.signal)
      .then((player) => setState({ status: 'ready', player }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', message: error instanceof ApiError ? error.message : String(error) })
        }
      })
    return () => controller.abort()
  }, [playerId, version])

  return state
}
