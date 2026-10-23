import { useCallback, useState } from 'react'
import { EmptyState } from '../../shared/components/ListState'
import { useToast } from '../../shared/hooks/useToast'
import type { Match } from './api/matches-api'
import MatchResult from './components/MatchResult'
import NewMatchModal from './components/NewMatchModal'

/** Tela Partidas: nova partida e o resultado devolvido por `POST /matches`. */
export default function LeaguePage() {
  const [creating, setCreating] = useState(false)
  const [match, setMatch] = useState<Match | null>(null)
  const showToast = useToast()
  const closeCreate = useCallback(() => setCreating(false), [])

  const handlePlayed = (played: Match) => {
    setCreating(false)
    setMatch(played)
    showToast({
      tone: 'success',
      title: 'Partida jogada',
      description: `${played.home.club_name} ${played.home.goals} × ${played.away.goals} ${played.away.club_name}. Placar e duelos devolvidos pela API.`,
    })
  }

  return (
    <section aria-labelledby="league-title">
      <header className="page-header">
        <div>
          <h1 id="league-title">Partidas</h1>
          <p className="module-description">Jogue partidas entre clubes com os 5 titulares escalados.</p>
        </div>
        <button type="button" className="button button-primary" onClick={() => setCreating(true)}>+ Nova partida</button>
      </header>

      {match ? (
        <MatchResult match={match} />
      ) : (
        <div className="list-card">
          <EmptyState
            title="Nenhuma partida jogada nesta tela"
            description="Escale os 5 titulares de dois clubes e jogue uma partida. O placar e os 6 duelos aparecem aqui."
            action={<button type="button" className="button button-secondary" onClick={() => setCreating(true)}>Nova partida</button>}
          />
        </div>
      )}

      {creating && <NewMatchModal onClose={closeCreate} onPlayed={handlePlayed} />}
    </section>
  )
}
