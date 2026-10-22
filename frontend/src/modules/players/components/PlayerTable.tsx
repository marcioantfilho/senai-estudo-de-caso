import DataTable, { type Column } from '../../../shared/components/DataTable'
import Dropdown from '../../../shared/components/Dropdown'
import { formatMoney } from '../../../shared/format/money'
import type { Club } from '../../clubs/api/clubs-api'
import type { Player } from '../api/players-api'
import { POSITION_LABELS } from '../player-labels'
import ConditionBadge from './ConditionBadge'

export type PlayerAction = 'details' | 'edit' | 'condition' | 'delete' | 'buy'

type PlayerTableProps = {
  players: Player[]
  clubs: readonly Club[]
  onAction: (action: PlayerAction, player: Player) => void
}

/** Linhas na ordem devolvida por `GET /players`. */
export default function PlayerTable({ players, clubs, onAction }: PlayerTableProps) {
  const clubById = new Map(clubs.map((club) => [club.id, club]))
  const columns: Column<Player>[] = [
    {
      key: 'name',
      header: 'Jogador',
      render: (player) => (
        <>
          <span className="cell-title">{player.name}</span>
          <span className="cell-subtitle">{POSITION_LABELS[player.position]}</span>
        </>
      ),
    },
    { key: 'position', header: 'Posição', render: (player) => <span className="tag">{player.position}</span> },
    { key: 'overall', header: 'Overall', numeric: true, cellClassName: 'strong', render: (player) => player.overall },
    { key: 'agility', header: 'Agilidade', numeric: true, render: (player) => player.agility },
    { key: 'age', header: 'Idade', numeric: true, render: (player) => player.age },
    { key: 'condition', header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
    { key: 'base_value', header: 'Valor base', numeric: true, cellClassName: 'muted', render: (player) => formatMoney(player.base_value) },
    {
      key: 'market_value',
      header: 'Valor de mercado',
      numeric: true,
      cellClassName: 'strong',
      render: (player) => formatMoney(player.market_value),
    },
    {
      key: 'club',
      header: 'Clube',
      render: (player) => (
        <ClubCell club={player.club_id === null ? null : clubById.get(player.club_id)} clubId={player.club_id} />
      ),
    },
    {
      key: 'actions',
      header: <span className="visually-hidden">Ações</span>,
      cellClassName: 'actions-cell',
      render: (player) => (
        <span className="row-actions">
          {player.club_id === null && (
            <button type="button" className="button button-secondary" onClick={() => onAction('buy', player)}>
              Comprar
            </button>
          )}
          <PlayerRowMenu player={player} onAction={onAction} />
        </span>
      ),
    },
  ]

  return <DataTable columns={columns} rows={players} rowKey={(player) => player.id} />
}

function ClubCell({ club, clubId }: { club: Club | null | undefined; clubId: number | null }) {
  if (clubId === null) {
    return <span className="tag tag-muted">Livre</span>
  }
  return (
    <span className="club-cell">
      {club ? (
        <>
          <span className="tag">{club.acronym}</span> {club.name}
        </>
      ) : (
        `Clube ${clubId}`
      )}
    </span>
  )
}

function PlayerRowMenu({ player, onAction }: { player: Player; onAction: PlayerTableProps['onAction'] }) {
  const isFree = player.club_id === null
  return (
    <Dropdown label="⋯" ariaLabel={`Ações de ${player.name}`} align="end" triggerClassName="icon-button">
      {(close) => (
        <ul className="menu-list" aria-label={player.name}>
          <li className="menu-heading">{player.name}</li>
          {([['details', 'Ver detalhes'], ['edit', 'Editar'], ['condition', 'Alterar condição']] as const).map(([action, label]) => (
            <li key={action}>
              <button type="button" className="menu-item" onClick={() => { close(); onAction(action, player) }}>
                {label}
              </button>
            </li>
          ))}
          {isFree && (
            <li>
              <button type="button" className="menu-item menu-item-danger" onClick={() => { close(); onAction('delete', player) }}>
                Excluir
                <span className="menu-item-hint">Disponível porque o jogador está livre.</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </Dropdown>
  )
}
