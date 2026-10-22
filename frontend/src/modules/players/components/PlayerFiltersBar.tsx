import Dropdown from '../../../shared/components/Dropdown'
import { formatMoney } from '../../../shared/format/money'
import type { Club } from '../../clubs/api/clubs-api'
import { CONDITIONS, POSITIONS } from '../api/players-api'
import { CONDITION_LABELS, POSITION_LABELS } from '../player-labels'
import { FREE_WITH_CLUB_REASON, rangeLabel, type PlayerFilters } from '../player-filters'
import { normalizeName, SEARCH_MIN_LENGTH, validateAgeFilter, validateMoneyFilter } from '../player-validation'
import RangeFilter from './RangeFilter'

type PlayerFiltersBarProps = {
  filters: PlayerFilters
  clubs: readonly Club[]
  onChange: (changes: Partial<PlayerFilters>) => void
}

type Option<T> = { value: T | undefined; label: string }

export default function PlayerFiltersBar({ filters, clubs, onChange }: PlayerFiltersBarProps) {
  const searchTooShort = normalizeName(filters.search).length > 0 && [...normalizeName(filters.search)].length < SEARCH_MIN_LENGTH
  const selectedClub = clubs.find(({ id }) => id === filters.clubId)
  const ages = rangeLabel(filters.minAge, filters.maxAge)
  const values = rangeLabel(
    filters.minValue && formatMoney(Number(filters.minValue.replace(',', '.'))),
    filters.maxValue && formatMoney(Number(filters.maxValue.replace(',', '.'))),
  )

  return (
    <section className="filters-bar" aria-label="Busca e filtros">
      <div className="search-field">
        <label className="visually-hidden" htmlFor="player-search">Buscar por nome</label>
        <input
          id="player-search"
          type="search"
          placeholder="Buscar por nome"
          value={filters.search}
          aria-describedby={searchTooShort ? 'player-search-hint' : undefined}
          onChange={(event) => onChange({ search: event.target.value })}
        />
        {searchTooShort && (
          <p id="player-search-hint" className="field-hint">Digite pelo menos {SEARCH_MIN_LENGTH} caracteres para buscar.</p>
        )}
      </div>

      <OptionsFilter
        label={filters.position ? `Posição: ${filters.position}` : 'Posição'}
        active={filters.position !== undefined}
        options={[{ value: undefined, label: 'Todas' }, ...POSITIONS.map((value) => ({ value, label: `${value} · ${POSITION_LABELS[value]}` }))]}
        selected={filters.position}
        onSelect={(position) => onChange({ position })}
      />
      <OptionsFilter
        label={filters.condition ? `Condição: ${CONDITION_LABELS[filters.condition]}` : 'Condição'}
        active={filters.condition !== undefined}
        options={[{ value: undefined, label: 'Todas' }, ...CONDITIONS.map((value) => ({ value, label: CONDITION_LABELS[value] }))]}
        selected={filters.condition}
        onSelect={(condition) => onChange({ condition })}
      />
      <OptionsFilter
        label={selectedClub ? `Clube: ${selectedClub.name}` : 'Clube'}
        active={filters.clubId !== undefined}
        disabled={filters.scope === 'free'}
        disabledReason={FREE_WITH_CLUB_REASON}
        options={[{ value: undefined, label: 'Todos' }, ...clubs.map((club) => ({ value: club.id, label: `${club.acronym} · ${club.name}` }))]}
        selected={filters.clubId}
        onSelect={(clubId) => onChange({ clubId })}
      />
      <Dropdown label={ages ? `Idade: ${ages}` : 'Idade'} active={ages !== undefined}>
        {(close) => (
          <RangeFilter
            min={filters.minAge}
            max={filters.maxAge}
            minLabel="Idade mínima"
            maxLabel="Idade máxima"
            validate={validateAgeFilter}
            onApply={(minAge, maxAge) => onChange({ minAge, maxAge })}
            onClose={close}
          />
        )}
      </Dropdown>
      <Dropdown label={values ? `Valor: ${values}` : 'Valor de mercado'} active={values !== undefined} align="end">
        {(close) => (
          <RangeFilter
            min={filters.minValue}
            max={filters.maxValue}
            minLabel="Valor mínimo"
            maxLabel="Valor máximo"
            validate={validateMoneyFilter}
            onApply={(minValue, maxValue) => onChange({ minValue, maxValue })}
            onClose={close}
          />
        )}
      </Dropdown>
    </section>
  )
}

type OptionsFilterProps<T> = {
  label: string
  active: boolean
  disabled?: boolean
  disabledReason?: string
  options: Option<T>[]
  selected: T | undefined
  onSelect: (value: T | undefined) => void
}

function OptionsFilter<T>({ label, active, disabled, disabledReason, options, selected, onSelect }: OptionsFilterProps<T>) {
  return (
    <Dropdown label={label} active={active} disabled={disabled} disabledReason={disabledReason}>
      {(close) => (
        <ul className="menu-list" role="listbox" aria-label={label}>
          {options.map((option) => (
            <li key={String(option.value ?? 'all')}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === selected}
                className="menu-item"
                onClick={() => {
                  onSelect(option.value)
                  close()
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dropdown>
  )
}
