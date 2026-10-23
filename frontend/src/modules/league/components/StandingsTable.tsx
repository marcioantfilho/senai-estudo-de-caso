import DataTable, { type Column } from '../../../shared/components/DataTable'
import { EmptyState, ErrorState, LoadingState } from '../../../shared/components/ListState'
import { formatSignedInteger } from '../../../shared/format/number'
import type { Standing } from '../api/matches-api'
import { useStandings } from '../hooks/useMatches'

const TIEBREAKERS = ['Mais pontos', 'Maior saldo de gols', 'Mais gols marcados', 'Nome do clube, em ordem alfabética']

/** F14: `GET /standings` na ordem e com os números devolvidos pela API, inclusive os clubes sem partidas. */
export default function StandingsTable() {
  const { state, reload } = useStandings()

  const columns: Column<Standing>[] = [
    { key: 'position', header: 'Posição', numeric: true, cellClassName: 'strong', render: (row) => row.position },
    { key: 'club_name', header: 'Clube', render: (row) => <span className="cell-title">{row.club_name}</span> },
    { key: 'played', header: <abbr title="Jogos">J</abbr>, numeric: true, render: (row) => row.played },
    { key: 'wins', header: <abbr title="Vitórias">V</abbr>, numeric: true, render: (row) => row.wins },
    { key: 'draws', header: <abbr title="Empates">E</abbr>, numeric: true, render: (row) => row.draws },
    { key: 'losses', header: <abbr title="Derrotas">D</abbr>, numeric: true, render: (row) => row.losses },
    { key: 'goals_for', header: <abbr title="Gols marcados">GP</abbr>, numeric: true, render: (row) => row.goals_for },
    { key: 'goals_against', header: <abbr title="Gols sofridos">GC</abbr>, numeric: true, render: (row) => row.goals_against },
    {
      key: 'goal_difference',
      header: <abbr title="Saldo de gols">SG</abbr>,
      numeric: true,
      render: (row) => formatSignedInteger(row.goal_difference),
    },
    { key: 'points', header: <abbr title="Pontos">Pts</abbr>, numeric: true, cellClassName: 'strong', render: (row) => row.points },
  ]

  return (
    <>
      <div className="list-card">
        <div className="list-card-header">
          <h2>Classificação</h2>
          <p>Todos os clubes, com 3 pontos por vitória e 1 por empate.</p>
        </div>
        {state.status === 'loading' && <LoadingState label="Carregando a classificação…" />}
        {state.status === 'error' && (
          <ErrorState
            title="Não foi possível carregar a classificação"
            description={state.message}
            action={<button type="button" className="button button-secondary" onClick={reload}>Tentar de novo</button>}
          />
        )}
        {state.status === 'ready' && state.data.length === 0 && (
          <EmptyState title="Nenhum clube cadastrado" description="Crie clubes para que eles apareçam na classificação." />
        )}
        {state.status === 'ready' && state.data.length > 0 && (
          <DataTable columns={columns} rows={state.data} rowKey={(row) => row.club_id} />
        )}
      </div>
      <p className="list-footnote">
        J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols marcados · GC: gols sofridos · SG: saldo de gols · Pts: pontos.
        Critérios, nesta ordem: {TIEBREAKERS.map((criterion, index) => `${index + 1}. ${criterion}`).join('; ')}.
      </p>
    </>
  )
}
