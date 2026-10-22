import DataTable, { type Column } from '../../../shared/components/DataTable'
import { formatDateTime } from '../../../shared/format/date-time'
import { formatMoney } from '../../../shared/format/money'
import { formatInteger } from '../../../shared/format/number'
import ConditionBadge from '../../players/components/ConditionBadge'
import type { SquadMember } from '../api/clubs-api'

/** Elenco na ordem devolvida por `GET /clubs/{id}` (RN11), com o contrato calculado pela API. */
export default function SquadTable({ players }: { players: SquadMember[] }) {
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
    { key: 'loyalty_until', header: 'Fim da fidelidade', render: (player) => <LoyaltyUntil value={player.contract.loyalty_until} /> },
    {
      key: 'remaining_days',
      header: 'Dias restantes',
      numeric: true,
      render: (player) => formatInteger(player.contract.remaining_days),
    },
    { key: 'penalty_rate', header: '% de multa', render: (player) => <span className="tag">{player.contract.penalty_rate}%</span> },
  ]

  return <DataTable columns={columns} rows={players} rowKey={(player) => player.id} />
}

function LoyaltyUntil({ value }: { value: string }) {
  const { date, time } = formatDateTime(value)
  return (
    <>
      <span className="cell-title">{date}</span>
      <span className="cell-subtitle">{time}</span>
    </>
  )
}
