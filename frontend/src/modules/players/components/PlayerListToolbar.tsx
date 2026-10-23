import OptionMenu from '../../../shared/components/OptionMenu'
import SegmentedControl from '../../../shared/components/SegmentedControl'
import { PLAYER_SORTS, type PlayerSort } from '../api/players-api'
import { SORT_LABELS } from '../player-labels'
import { FREE_WITH_CLUB_REASON, type ClubScope } from '../player-filters'

type PlayerListToolbarProps = {
  scope: ClubScope
  clubSelected: boolean
  sort: PlayerSort
  onScopeChange: (scope: ClubScope) => void
  onSortChange: (sort: PlayerSort) => void
}

export default function PlayerListToolbar({ scope, clubSelected, sort, onScopeChange, onSortChange }: PlayerListToolbarProps) {
  const scopes = [
    { value: 'all', label: 'Todos' },
    { value: 'free', label: 'Livres', disabledReason: clubSelected ? FREE_WITH_CLUB_REASON : undefined },
    { value: 'club', label: 'Em clubes' },
  ] as const

  return (
    <div className="list-toolbar">
      <SegmentedControl label="Clube do jogador" options={scopes} selected={scope} onSelect={onScopeChange} />
      <OptionMenu
        label={`Ordenar: ${SORT_LABELS[sort].toLowerCase()}`}
        heading="Ordenar por"
        align="end"
        options={PLAYER_SORTS.map((value) => ({ value, label: SORT_LABELS[value] }))}
        selected={sort}
        onSelect={onSortChange}
      />
    </div>
  )
}
