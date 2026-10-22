import { useEffect, useState } from 'react'
import { getLineup } from '../api/lineup-api'

/** Se o jogador é titular do clube, por `GET /clubs/{id}/lineup`; `false` sem clube ou se a consulta falhar. */
export function useIsStarter(clubId: number | null, playerId: number) {
  const [isStarter, setIsStarter] = useState(false)

  useEffect(() => {
    if (clubId === null) {
      return
    }
    const controller = new AbortController()
    getLineup(clubId, controller.signal)
      .then((lineup) => setIsStarter(lineup.players.some(({ id }) => id === playerId)))
      .catch(() => setIsStarter(false))
    return () => controller.abort()
  }, [clubId, playerId])

  return isStarter
}
