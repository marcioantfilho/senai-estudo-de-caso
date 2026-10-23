import DataTable, { type Column } from '../../../shared/components/DataTable'
import DateTimeCell from '../../../shared/components/DateTimeCell'
import { formatMoney } from '../../../shared/format/money'
import { formatInteger } from '../../../shared/format/number'
import ConditionBadge from '../../players/components/ConditionBadge'
import type { SquadMember } from '../api/clubs-api'

type SquadTableProps = {
  players: SquadMember[]
  onSell: (player: SquadMember) => void
}

/** Elenco na ordem devolvida por `GET /clubs/{id}` (RN11), com o contrato calculado pela API e o botão Vender. */
export default function SquadTable({ players, onSell }: SquadTableProps) {
  const columns: Column<SquadMember>[] = [
    { key: 'name', header: 'Jogador', render: (player) => <span className="cell-title">{player.name}</span> },
    { key: 'position', header: 'Posição', render: (player) => <span className="tag">{player.position}</span> },
    { key: 'overall', header: 'Overall', numeric: true, cellClassName: 'strong', render: (player) => player.overall },
    { key: 'condition', header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
    {
      key: 'market_value',
      header: 'Valor de mercado',
      numeric: true,
      cellClassName: 'strong',
      render: (player) => formatMoney(player.market_value),
    },
    {
      key: 'purchase_value',
      header: 'Valor de compra',
      numeric: true,
      cellClassName: 'muted',
      render: (player) => formatMoney(player.contract.purchase_value),
    },
    { key: 'loyalty_until', header: 'Fim da fidelidade', render: (player) => <DateTimeCell value={player.contract.loyalty_until} /> },
    {
      key: 'remaining_days',
      header: 'Dias restantes',
      numeric: true,
      render: (player) => formatInteger(player.contract.remaining_days),
    },
    { key: 'penalty_rate', header: '% de multa', render: (player) => <span className="tag">{player.contract.penalty_rate}%</span> },
    {
      key: 'actions',
      header: <span className="visually-hidden">Ações</span>,
      cellClassName: 'actions-cell',
      render: (player) => (
        <button type="button" className="button button-secondary" onClick={() => onSell(player)}>
          Vender
        </button>
      ),
    },
  ]

  return <DataTable columns={columns} rows={players} rowKey={(player) => player.id} />
}
