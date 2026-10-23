import { useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import { saveFile } from '../../../shared/browser/save-file'
import { EmptyState, ErrorState, LoadingState } from '../../../shared/components/ListState'
import OptionMenu from '../../../shared/components/OptionMenu'
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction'
import { useToast } from '../../../shared/hooks/useToast'
import { exportClubTransactions, TRANSACTION_TYPES, type TransactionFilter, type TransactionType } from '../api/market-api'
import { useTransactionHistory } from '../hooks/useTransactionHistory'
import { useTransactionParticipants } from '../hooks/useTransactionParticipants'
import { TRANSACTION_TYPE_LABELS } from '../transaction-labels'
import TransactionSummaryList from './TransactionSummaryList'
import TransactionTable from './TransactionTable'
import '../market.css'

const EMPTY_FILTER: TransactionFilter = { types: [] }

/** F09 a F11: histórico do clube com filtros, totais do `summary` e exportação do CSV da API. */
export default function TransactionHistoryPanel({ clubId }: { clubId: number }) {
  const [filter, setFilter] = useState<TransactionFilter>(EMPTY_FILTER)
  const { state, reload } = useTransactionHistory(clubId, filter)
  const participants = useTransactionParticipants(clubId)
  const exporting = useAsyncAction()
  const showToast = useToast()
  const filtered = filter.types.length > 0 || filter.playerId !== undefined
  const selectedPlayer = participants.find(({ id }) => id === filter.playerId)
  const clearButton = (
    <button type="button" className="button button-secondary" onClick={() => setFilter(EMPTY_FILTER)}>Limpar filtros</button>
  )

  const toggleType = (type: TransactionType) =>
    setFilter((current) => ({
      ...current,
      types: current.types.includes(type) ? current.types.filter((item) => item !== type) : [...current.types, type],
    }))

  const exportCsv = () =>
    exporting.run(async () => {
      const fileName = `historico-clube-${clubId}.csv`
      try {
        saveFile(await exportClubTransactions(clubId, filter), fileName)
        showToast({ tone: 'success', title: 'CSV baixado', description: `${fileName}, com os filtros da tela.` })
      } catch (error) {
        showToast({ tone: 'error', title: 'Não foi possível exportar', description: error instanceof ApiError ? error.message : String(error) })
      }
    })

  return (
    <div className="list-card">
      <div className="list-card-header">
        <h2>Histórico de transações</h2>
        <p>Da mais recente para a mais antiga, com o nome e os valores do momento de cada operação.</p>
      </div>

      <div className="list-toolbar transaction-filters">
        <div className="segmented" role="group" aria-label="Tipo">
          {TRANSACTION_TYPES.map((type) => (
            <button key={type} type="button" aria-pressed={filter.types.includes(type)} onClick={() => toggleType(type)}>
              {TRANSACTION_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <OptionMenu
          label={`Jogador: ${selectedPlayer?.name ?? 'todos'}`}
          heading="Jogador"
          active={filter.playerId !== undefined}
          options={[
            { value: undefined, label: 'Todos' },
            ...participants.map((participant) => ({ value: participant.id, label: participant.name })),
          ]}
          selected={filter.playerId}
          onSelect={(playerId) => setFilter((current) => ({ ...current, playerId }))}
        />
        {filtered && <button type="button" className="link-button" onClick={() => setFilter(EMPTY_FILTER)}>Limpar filtros</button>}
        <button type="button" className="button button-secondary transaction-export" disabled={exporting.pending}
          onClick={() => void exportCsv()}>
          {exporting.pending ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>

      {state.status === 'loading' && <LoadingState label="Carregando o histórico…" />}
      {state.status === 'error' && (
        <ErrorState
          title="Não foi possível carregar o histórico"
          description={state.message}
          action={filtered ? clearButton : (
            <button type="button" className="button button-secondary" onClick={reload}>Tentar de novo</button>
          )}
        />
      )}
      {state.status === 'ready' && (
        <>
          {state.data.data.length > 0 ? (
            <TransactionTable transactions={state.data.data} />
          ) : filtered ? (
            <EmptyState title="Nenhuma transação com esses filtros" description="Tire alguns filtros para ver mais transações." action={clearButton} />
          ) : (
            <EmptyState title="Nenhuma transação" description="As compras e as vendas do clube aparecem aqui." />
          )}
          <TransactionSummaryList summary={state.data.summary} />
          <p className="list-footnote transaction-footnote">Os totais respeitam os filtros. O CSV usa os mesmos filtros da tela.</p>
        </>
      )}
    </div>
  )
}
