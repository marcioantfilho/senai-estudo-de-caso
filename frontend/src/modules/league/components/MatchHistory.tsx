import { useState } from 'react'
import DataTable, { type Column } from '../../../shared/components/DataTable'
import Dropdown from '../../../shared/components/Dropdown'
import { EmptyState, ErrorState, LoadingState } from '../../../shared/components/ListState'
import { formatDateTime } from '../../../shared/format/date-time'
import { useClubs } from '../../clubs/hooks/useClubs'
import type { MatchSummary } from '../api/matches-api'
import { useMatchList } from '../hooks/useMatches'
import { MATCH_RESULT_LABELS } from '../match-labels'

type MatchHistoryProps = {
  onOpen: (matchId: number) => void
  onNewMatch: () => void
}

/** F14: partidas na ordem de `GET /matches`, com o filtro por clube. */
export default function MatchHistory({ onOpen, onNewMatch }: MatchHistoryProps) {
  const [clubId, setClubId] = useState<number>()
  const clubs = useClubs()
  const { state, reload } = useMatchList(clubId)
  const selectedClub = clubs.find(({ id }) => id === clubId)
  const clearButton = (
    <button type="button" className="button button-secondary" onClick={() => setClubId(undefined)}>Limpar filtro</button>
  )

  const columns: Column<MatchSummary>[] = [
    { key: 'played_at', header: 'Data e hora', render: (match) => <DateTime value={match.played_at} /> },
    { key: 'home', header: 'Mandante', render: (match) => <span className="cell-title">{match.home.club_name}</span> },
    {
      key: 'score',
      header: 'Placar',
      cellClassName: 'strong match-history-score',
      render: (match) => `${match.home.goals} × ${match.away.goals}`,
    },
    { key: 'away', header: 'Visitante', render: (match) => <span className="cell-title">{match.away.club_name}</span> },
    { key: 'result', header: 'Resultado', render: (match) => <span className="tag">{MATCH_RESULT_LABELS[match.result]}</span> },
    {
      key: 'actions',
      header: <span className="visually-hidden">Ações</span>,
      cellClassName: 'actions-cell',
      render: (match) => (
        <button type="button" className="button button-secondary" onClick={() => onOpen(match.id)}>Ver duelos</button>
      ),
    },
  ]

  return (
    <div className="list-card">
      <div className="list-card-header">
        <h2>Histórico de partidas</h2>
        <p>Da mais recente para a mais antiga. "Ver duelos" abre a partida com os 6 duelos gravados.</p>
      </div>
      <div className="list-toolbar match-history-toolbar">
        <Dropdown label={`Clube: ${selectedClub?.name ?? 'todos'}`} active={clubId !== undefined}>
          {(close) => (
            <ul className="menu-list" aria-label="Clube">
              <li>
                <button type="button" className="menu-item" aria-selected={clubId === undefined}
                  onClick={() => { close(); setClubId(undefined) }}>
                  Todos
                </button>
              </li>
              {clubs.map((club) => (
                <li key={club.id}>
                  <button type="button" className="menu-item" aria-selected={clubId === club.id}
                    onClick={() => { close(); setClubId(club.id) }}>
                    {club.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Dropdown>
        {state.status === 'ready' && <span className="muted">{state.data.length} {state.data.length === 1 ? 'partida' : 'partidas'}</span>}
      </div>

      {state.status === 'loading' && <LoadingState label="Carregando as partidas…" />}
      {state.status === 'error' && (
        <ErrorState
          title="Não foi possível carregar as partidas"
          description={state.message}
          action={clubId === undefined
            ? <button type="button" className="button button-secondary" onClick={reload}>Tentar de novo</button>
            : clearButton}
        />
      )}
      {state.status === 'ready' && state.data.length === 0 && (
        clubId === undefined ? (
          <EmptyState
            title="Nenhuma partida jogada"
            description="Escale os 5 titulares de dois clubes e jogue a primeira partida. O resultado aparece aqui e na classificação."
            action={<button type="button" className="button button-secondary" onClick={onNewMatch}>Nova partida</button>}
          />
        ) : (
          <EmptyState title="Nenhuma partida deste clube" description="O clube ainda não jogou como mandante nem como visitante." action={clearButton} />
        )
      )}
      {state.status === 'ready' && state.data.length > 0 && (
        <DataTable columns={columns} rows={state.data} rowKey={(match) => match.id} />
      )}
    </div>
  )
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
