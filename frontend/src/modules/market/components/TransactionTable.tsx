import DataTable, { type Column } from '../../../shared/components/DataTable'
import { formatDateTime } from '../../../shared/format/date-time'
import { formatMoney, formatSignedMoney } from '../../../shared/format/money'
import type { Transaction } from '../api/market-api'
import { TRANSACTION_TYPE_LABELS } from '../transaction-labels'

const NO_PROFIT = '—'

/** Transações na ordem devolvida pela API (RN17), com o nome e os valores gravados. */
export default function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const columns: Column<Transaction>[] = [
    { key: 'created_at', header: 'Data e hora', render: (transaction) => <DateTime value={transaction.created_at} /> },
    { key: 'type', header: 'Tipo', render: (transaction) => <span className="tag">{TRANSACTION_TYPE_LABELS[transaction.type]}</span> },
    { key: 'player_name', header: 'Jogador', render: (transaction) => <span className="cell-title">{transaction.player_name}</span> },
    { key: 'value', header: 'Valor', numeric: true, render: (transaction) => formatMoney(transaction.value) },
    { key: 'fee', header: 'Taxa ou comissão', numeric: true, render: (transaction) => formatMoney(transaction.fee) },
    { key: 'penalty', header: 'Multa', numeric: true, render: (transaction) => formatMoney(transaction.penalty) },
    {
      key: 'profit',
      header: 'Lucro',
      numeric: true,
      render: (transaction) => (transaction.profit === null ? NO_PROFIT : formatSignedMoney(transaction.profit)),
    },
    {
      key: 'cash_change',
      header: 'Variação do caixa',
      numeric: true,
      cellClassName: 'strong',
      render: (transaction) => formatSignedMoney(transaction.cash_change),
    },
  ]

  return <DataTable columns={columns} rows={transactions} rowKey={(transaction) => transaction.id} />
}

function DateTime({ value }: { value: string }) {
  const { date, time } = formatDateTime(value)
  return (
    <>
      <span className="cell-title">{date}</span>
      <span className="cell-subtitle">{time}</span>
    </>
  )
}
