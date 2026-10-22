import { normalizeName } from '../../shared/validation/text'
import type { Club } from '../clubs/api/clubs-api'
import type { Condition, PlayerListQuery, PlayerSort, Position } from './api/players-api'
import { CONDITION_LABELS } from './player-labels'
import { SEARCH_MIN_LENGTH, toApiDecimal } from './player-validation'

export const PAGE_SIZE = 10

/** A API recusa `free=true` com `club_id` (400); a tela impede a combinação e mostra o motivo. */
export const FREE_WITH_CLUB_REASON = '“Livres” não combina com o filtro por clube.'

export type ClubScope = 'all' | 'free' | 'club'

export type PlayerFilters = {
  search: string
  position?: Position
  condition?: Condition
  scope: ClubScope
  clubId?: number
  minAge: string
  maxAge: string
  minValue: string
  maxValue: string
}

export const EMPTY_FILTERS: PlayerFilters = {
  search: '',
  position: undefined,
  condition: undefined,
  scope: 'all',
  clubId: undefined,
  minAge: '',
  maxAge: '',
  minValue: '',
  maxValue: '',
}

export type FilterChip = { key: string; label: string; clear: Partial<PlayerFilters> }

/** Busca que vai à API: com menos de 2 caracteres, não busca (a API recusaria). */
export function effectiveSearch(search: string): string | undefined {
  const normalized = normalizeName(search)
  return [...normalized].length >= SEARCH_MIN_LENGTH ? normalized : undefined
}

export function toListQuery(filters: PlayerFilters, sort: PlayerSort, page: number): PlayerListQuery {
  return {
    search: effectiveSearch(filters.search),
    position: filters.position,
    condition: filters.condition,
    free: filters.scope === 'all' ? undefined : filters.scope === 'free',
    club_id: filters.clubId,
    min_age: filters.minAge === '' ? undefined : Number(filters.minAge),
    max_age: filters.maxAge === '' ? undefined : Number(filters.maxAge),
    min_value: toApiDecimal(filters.minValue),
    max_value: toApiDecimal(filters.maxValue),
    sort,
    page,
    limit: PAGE_SIZE,
  }
}

export function rangeLabel(min: string, max: string, unit = ''): string | undefined {
  if (min === '' && max === '') {
    return undefined
  }
  if (min === '') {
    return `até ${max}${unit}`
  }
  return max === '' ? `a partir de ${min}${unit}` : `${min} a ${max}${unit}`
}

export function activeFilterChips(filters: PlayerFilters, clubs: readonly Club[]): FilterChip[] {
  const chips: FilterChip[] = []
  const search = effectiveSearch(filters.search)
  if (search) {
    chips.push({ key: 'search', label: `Busca: ${search}`, clear: { search: '' } })
  }
  if (filters.position) {
    chips.push({ key: 'position', label: `Posição: ${filters.position}`, clear: { position: undefined } })
  }
  if (filters.condition) {
    chips.push({ key: 'condition', label: `Condição: ${CONDITION_LABELS[filters.condition]}`, clear: { condition: undefined } })
  }
  if (filters.clubId !== undefined) {
    const club = clubs.find(({ id }) => id === filters.clubId)
    chips.push({ key: 'club', label: `Clube: ${club?.name ?? filters.clubId}`, clear: { clubId: undefined } })
  }
  const ages = rangeLabel(filters.minAge, filters.maxAge, ' anos')
  if (ages) {
    chips.push({ key: 'age', label: `Idade: ${ages}`, clear: { minAge: '', maxAge: '' } })
  }
  const values = rangeLabel(filters.minValue, filters.maxValue)
  if (values) {
    chips.push({ key: 'value', label: `Valor de mercado: ${values}`, clear: { minValue: '', maxValue: '' } })
  }
  return chips
}
