import { useCallback } from 'react'
import { useApiResource } from '../../../shared/hooks/useApiResource'
import { getMatch, getStandings, listMatches } from '../api/matches-api'

/** `GET /matches`, da mais recente para a mais antiga, com o filtro `club_id` opcional. */
export function useMatchList(clubId: number | undefined) {
  return useApiResource(useCallback((signal: AbortSignal) => listMatches(clubId, signal), [clubId]))
}

/** `GET /matches/{id}`: a partida com os 6 duelos gravados. */
export function useMatchDetails(matchId: number) {
  return useApiResource(useCallback((signal: AbortSignal) => getMatch(matchId, signal), [matchId]))
}

/** `GET /standings`: todos os clubes, na ordem e com os números da API. */
export function useStandings() {
  return useApiResource(getStandings)
}
