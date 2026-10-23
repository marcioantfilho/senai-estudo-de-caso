import { useCallback } from 'react'
import { useApiResource } from '../../../shared/hooks/useApiResource'
import { listClubs, type ClubSort } from '../api/clubs-api'

/** `GET /clubs` na ordem escolhida; a lista vem na ordem devolvida pela API. */
export function useClubList(sort: ClubSort) {
  return useApiResource(useCallback((signal: AbortSignal) => listClubs(sort, signal), [sort]))
}
