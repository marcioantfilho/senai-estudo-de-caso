import { useCallback, useState } from 'react'
import { useToast } from '../../shared/hooks/useToast'
import type { Match } from './api/matches-api'
import MatchDetailsView from './components/MatchDetailsView'
import MatchHistory from './components/MatchHistory'
import MatchResult from './components/MatchResult'
import NewMatchModal from './components/NewMatchModal'
import StandingsTable from './components/StandingsTable'
import './league.css'

type LeagueTab = 'matches' | 'standings'

const LEAGUE_TABS: readonly (readonly [LeagueTab, string])[] = [
  ['matches', 'Partidas'],
  ['standings', 'Classificação'],
]

/** Partida aberta: a recém-jogada vem da resposta do `POST`; a do histórico é lida de `GET /matches/{id}`. */
type OpenMatch = { played: Match } | { matchId: number }

/**
 * Liga: partidas (nova partida, histórico e duelos) e classificação. Cada lista é lida de novo
 * da API ao ser aberta, então uma partida nova já aparece no histórico e na classificação.
 */
export default function LeaguePage() {
  const [tab, setTab] = useState<LeagueTab>('matches')
  const [openMatch, setOpenMatch] = useState<OpenMatch | null>(null)
  const [creating, setCreating] = useState(false)
  const showToast = useToast()
  const closeCreate = useCallback(() => setCreating(false), [])
  const openCreate = useCallback(() => setCreating(true), [])

  const changeTab = (next: LeagueTab) => {
    setTab(next)
    setOpenMatch(null)
  }

  const handlePlayed = (played: Match) => {
    setCreating(false)
    setTab('matches')
    setOpenMatch({ played })
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
          <h1 id="league-title">Liga</h1>
          <p className="module-description">Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico e a classificação.</p>
        </div>
        <button type="button" className="button button-primary" onClick={openCreate}>+ Nova partida</button>
      </header>

      <div className="segmented league-tabs" role="group" aria-label="Seções da liga">
        {LEAGUE_TABS.map(([value, label]) => (
          <button key={value} type="button" aria-pressed={tab === value} onClick={() => changeTab(value)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'standings' && <StandingsTable />}
      {tab === 'matches' && openMatch && (
        <>
          <button type="button" className="link-button back-link" onClick={() => setOpenMatch(null)}>‹ Voltar para partidas</button>
          {'played' in openMatch ? <MatchResult match={openMatch.played} /> : <MatchDetailsView matchId={openMatch.matchId} />}
        </>
      )}
      {tab === 'matches' && !openMatch && (
        <MatchHistory onOpen={(matchId) => setOpenMatch({ matchId })} onNewMatch={openCreate} />
      )}

      {creating && <NewMatchModal onClose={closeCreate} onPlayed={handlePlayed} />}
    </section>
  )
}
