import type { ClubSort } from './api/clubs-api'

export const MAX_CLUBS = 20
export const SQUAD_LIMIT = 12

export const CLUB_SORT_LABELS: Record<ClubSort, string> = {
  name: 'Nome',
  net_worth_desc: 'Patrimônio (maior para o menor)',
  net_worth_asc: 'Patrimônio (menor para o maior)',
}
