import Dropdown from '../../../shared/components/Dropdown'
import { formatMoney } from '../../../shared/format/money'
import type { Club } from '../../clubs/api/clubs-api'
import type { Player } from '../api/players-api'
import { POSITION_LABELS } from '../player-labels'
import ConditionBadge from './ConditionBadge'

export type PlayerAction = 'details' | 'edit' | 'condition' | 'delete'

type PlayerTableProps = {
  players: Player[]
  clubs: readonly Club[]
  onAction: (action: PlayerAction, player: Player) => void
}

/** Linhas na ordem devolvida por `GET /players`. */
export default function PlayerTable({ players, clubs, onAction }: PlayerTableProps) {
  const clubById = new Map(clubs.map((club) => [club.id, club]))

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Jogador</th>
            <th scope="col">Posição</th>
            <th scope="col" className="numeric">Overall</th>
            <th scope="col" className="numeric">Agilidade</th>
            <th scope="col" className="numeric">Idade</th>
            <th scope="col">Condição</th>
            <th scope="col" className="numeric">Valor base</th>
            <th scope="col" className="numeric">Valor de mercado</th>
            <th scope="col">Clube</th>
            <th scope="col"><span className="visually-hidden">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td>
                <span className="cell-title">{player.name}</span>
                <span className="cell-subtitle">{POSITION_LABELS[player.position]}</span>
              </td>
              <td><span className="tag">{player.position}</span></td>
              <td className="numeric strong">{player.overall}</td>
              <td className="numeric">{player.agility}</td>
              <td className="numeric">{player.age}</td>
              <td><ConditionBadge condition={player.condition} /></td>
              <td className="numeric muted">{formatMoney(player.base_value)}</td>
              <td className="numeric strong">{formatMoney(player.market_value)}</td>
              <td><ClubCell club={player.club_id === null ? null : clubById.get(player.club_id)} clubId={player.club_id} /></td>
              <td className="actions-cell">
                <PlayerRowMenu player={player} onAction={onAction} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
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
