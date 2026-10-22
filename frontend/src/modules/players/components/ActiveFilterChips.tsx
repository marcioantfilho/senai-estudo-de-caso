import type { FilterChip, PlayerFilters } from '../player-filters'

type ActiveFilterChipsProps = {
  chips: FilterChip[]
  onChange: (changes: Partial<PlayerFilters>) => void
  onClearAll: () => void
}

export default function ActiveFilterChips({ chips, onChange, onClearAll }: ActiveFilterChipsProps) {
  if (chips.length === 0) {
    return null
  }
  return (
    <div className="active-filters">
      <span className="active-filters-label">Filtros ativos:</span>
      {chips.map((chip) => (
        <span key={chip.key} className="chip">
          {chip.label}
          <button type="button" className="chip-remove" aria-label={`Remover ${chip.label}`} onClick={() => onChange(chip.clear)}>
            ×
          </button>
        </span>
      ))}
      <button type="button" className="link-button" onClick={onClearAll}>
        Limpar filtros
      </button>
    </div>
  )
}
