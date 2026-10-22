import { apiRequest } from '../../../shared/api/http-client'
import type { Player } from '../../players/api/players-api'

export const CLUB_SORTS = ['name', 'net_worth_desc', 'net_worth_asc'] as const

export type ClubSort = (typeof CLUB_SORTS)[number]

/** Campos mínimos de cada clube (2.2). */
export type Club = {
  id: number
  name: string
  acronym: string
  cash: number
  squad_value: number
  net_worth: number
}

/** Contrato de cada jogador do elenco, calculado pela API para uma venda agora (RN11 e RN15). */
export type SquadContract = {
  purchase_value: number
  loyalty_until: string
  remaining_days: number
  penalty_rate: number
}

export type SquadMember = Player & { contract: SquadContract }

/** Formato de `GET /clubs/{id}` (2.2.2): elenco na ordem da RN11. */
export type ClubDetails = Club & { players: SquadMember[] }

export type ClubRegistration = Pick<Club, 'name' | 'acronym'>

export function listClubs(sort: ClubSort, signal?: AbortSignal): Promise<Club[]> {
  return apiRequest<Club[]>('/clubs', { query: { sort }, signal })
}

export function getClub(id: number, signal?: AbortSignal): Promise<ClubDetails> {
  return apiRequest<ClubDetails>(`/clubs/${id}`, { signal })
}

export function createClub(registration: ClubRegistration): Promise<Club> {
  return apiRequest<Club>('/clubs', { method: 'POST', body: registration })
}
