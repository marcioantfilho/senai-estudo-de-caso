import Dropdown from '../../../shared/components/Dropdown'
import { PLAYER_SORTS, type PlayerSort } from '../api/players-api'
import { SORT_LABELS } from '../player-labels'
import { FREE_WITH_CLUB_REASON, type ClubScope } from '../player-filters'

const SCOPES: { value: ClubScope; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'free', label: 'Livres' },
  { value: 'club', label: 'Em clubes' },
]

type PlayerListToolbarProps = {
  scope: ClubScope
  clubSelected: boolean
  sort: PlayerSort
  onScopeChange: (scope: ClubScope) => void
  onSortChange: (sort: PlayerSort) => void
}

export default function PlayerListToolbar({ scope, clubSelected, sort, onScopeChange, onSortChange }: PlayerListToolbarProps) {
  return (
    <div className="list-toolbar">
      <div className="segmented" role="group" aria-label="Clube do jogador">
        {SCOPES.map((option) => {
          const blocked = option.value === 'free' && clubSelected
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={scope === option.value}
              disabled={blocked}
              title={blocked ? FREE_WITH_CLUB_REASON : undefined}
              onClick={() => onScopeChange(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <Dropdown label={`Ordenar: ${SORT_LABELS[sort].toLowerCase()}`} align="end">
        {(close) => (
          <ul className="menu-list" role="listbox" aria-label="Ordenar por">
            {PLAYER_SORTS.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option === sort}
                  className="menu-item"
                  onClick={() => {
                    onSortChange(option)
                    close()
                  }}
                >
                  {SORT_LABELS[option]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Dropdown>
    </div>
  )
}
