import { apiRequest } from '../../../shared/api/http-client'

export const POSITIONS = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as const
export const CONDITIONS = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'] as const
export const PLAYER_SORTS = ['name', 'value_desc', 'value_asc', 'age_desc', 'age_asc', 'position'] as const

export type Position = (typeof POSITIONS)[number]
export type Condition = (typeof CONDITIONS)[number]
export type PlayerSort = (typeof PLAYER_SORTS)[number]

/** Formato de `GET /players/{id}` (2.1.2). */
export type Player = {
  id: number
  name: string
  position: Position
  agility: number
  age: number
  condition: Condition
  base_value: number
  market_value: number
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  potential: number
  overall: number
  club_id: number | null
}

export type PlayerPage = {
  data: Player[]
  meta: { page: number; limit: number; total_items: number; total_pages: number }
}

/** Query params de `GET /players` ("1. Filtros e query params aceitos"). */
export type PlayerListQuery = {
  search?: string
  position?: Position
  condition?: Condition
  free?: boolean
  club_id?: number
  min_age?: number
  max_age?: number
  min_value?: string
  max_value?: string
  sort: PlayerSort
  page: number
  limit: number
}

export type PlayerProfile = Pick<Player, 'name' | 'position' | 'agility' | 'age'>

export type PlayerRegistration = PlayerProfile &
  Pick<Player, 'pace' | 'shooting' | 'passing' | 'dribbling' | 'defending' | 'physical' | 'potential'>

export function listPlayers(query: PlayerListQuery, signal?: AbortSignal): Promise<PlayerPage> {
  return apiRequest<PlayerPage>('/players', { query, signal })
}

export function getPlayer(id: number, signal?: AbortSignal): Promise<Player> {
  return apiRequest<Player>(`/players/${id}`, { signal })
}

export function registerPlayer(registration: PlayerRegistration): Promise<Player> {
  return apiRequest<Player>('/players', { method: 'POST', body: registration })
}

export function updatePlayer(id: number, profile: PlayerProfile): Promise<Player> {
  return apiRequest<Player>(`/players/${id}`, { method: 'PUT', body: profile })
}

export function changePlayerCondition(id: number, condition: Condition): Promise<Player> {
  return apiRequest<Player>(`/players/${id}/condition`, { method: 'PATCH', body: { condition } })
}

export function deletePlayer(id: number): Promise<void> {
  return apiRequest<void>(`/players/${id}`, { method: 'DELETE' })
}
