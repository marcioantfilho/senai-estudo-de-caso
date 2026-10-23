import { apiRequest } from '../../../shared/api/http-client'
import type { Player } from '../../players/api/players-api'

export const FORMATIONS = ['3-1', '2-2', '2-1-1', '1-2-1'] as const

export type Formation = (typeof FORMATIONS)[number]

/** Formato de `GET /clubs/{id}/lineup` e da resposta do `PUT` (2.4.1): titulares na ordem do elenco. */
export type Lineup = {
  club_id: number
  formation: Formation | null
  complete: boolean
  players: Player[]
}

/** Corpo de `PUT /clubs/{id}/lineup`: a formação e os 5 ids, em qualquer ordem. */
export type LineupOrder = {
  formation: Formation
  player_ids: number[]
}

export function getLineup(clubId: number, signal?: AbortSignal): Promise<Lineup> {
  return apiRequest<Lineup>(`/clubs/${clubId}/lineup`, { signal })
}

export function saveLineup(clubId: number, order: LineupOrder): Promise<Lineup> {
  return apiRequest<Lineup>(`/clubs/${clubId}/lineup`, { method: 'PUT', body: order })
}
