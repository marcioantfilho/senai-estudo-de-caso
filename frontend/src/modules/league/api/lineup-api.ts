import { apiRequest } from '../../../shared/api/http-client'

/** Formato de `GET /clubs/{id}/lineup` (2.4.1), só com os campos usados pela tela. */
export type Lineup = {
  club_id: number
  formation: string | null
  complete: boolean
  players: { id: number }[]
}

export function getLineup(clubId: number, signal?: AbortSignal): Promise<Lineup> {
  return apiRequest<Lineup>(`/clubs/${clubId}/lineup`, { signal })
}
