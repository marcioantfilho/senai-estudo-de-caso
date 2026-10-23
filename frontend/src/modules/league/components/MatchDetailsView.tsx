import { ErrorState, LoadingState } from '../../../shared/components/ListState'
import { useMatchDetails } from '../hooks/useMatches'
import MatchResult from './MatchResult'

/** Partida do histórico, lida de `GET /matches/{id}` com os duelos gravados, sem consultar os jogadores atuais. */
export default function MatchDetailsView({ matchId }: { matchId: number }) {
  const { state, reload } = useMatchDetails(matchId)

  if (state.status === 'ready') {
    return <MatchResult match={state.data} />
  }
  return (
    <div className="list-card">
      {state.status === 'loading' && <LoadingState label="Carregando a partida…" />}
      {state.status === 'error' && (
        <ErrorState
          title="Não foi possível carregar a partida"
          description={state.message}
          action={<button type="button" className="button button-secondary" onClick={reload}>Tentar de novo</button>}
        />
      )}
    </div>
  )
}
