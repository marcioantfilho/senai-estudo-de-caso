import { formatMoney, formatSignedMoney } from '../../../shared/format/money'
import type { TransactionSummary } from '../api/market-api'

/** F10: os totais do `summary` como a API devolveu para os filtros aplicados. */
export default function TransactionSummaryList({ summary }: { summary: TransactionSummary }) {
  return (
    <dl className="transaction-summary">
      <SummaryItem label="Total pago em compras" value={formatMoney(summary.total_spent)} note="Valor + taxa" />
      <SummaryItem label="Total recebido em vendas" value={formatMoney(summary.total_received)} note="Crédito líquido" />
      <SummaryItem label="Taxas e comissões" value={formatMoney(summary.total_fees)} note="Somadas" />
      <SummaryItem label="Multas" value={formatMoney(summary.total_penalties)} note="Por fidelidade" />
      <SummaryItem label="Lucro total" value={formatSignedMoney(summary.total_profit)} note="Soma dos lucros, com sinal" />
    </dl>
  )
}

function SummaryItem({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        <span className="transaction-summary-value">{value}</span>
        <span className="transaction-summary-note">{note}</span>
      </dd>
    </div>
  )
}
