import DataTable, { type Column } from '../../../shared/components/DataTable'
import { formatDateTime } from '../../../shared/format/date-time'
import ConditionBadge from '../../players/components/ConditionBadge'
import type { Duel, DuelPlayer, Match, MatchSide } from '../api/matches-api'
import { DUEL_ATTRIBUTE_LABELS, MATCH_RESULT_LABELS } from '../match-labels'
import '../league.css'

/** F13: placar, `result` e os 6 duelos como a API devolveu, sem recalcular nada. */
export default function MatchResult({ match }: { match: Match }) {
  const { date, time } = formatDateTime(match.played_at)
  const clubNames = new Map([match.home, match.away].map((side) => [side.club_id, side.club_name]))

  const columns: Column<Duel>[] = [
    { key: 'order', header: 'Duelo', numeric: true, render: (duel) => duel.order },
    { key: 'attacking_club', header: 'Ataca', render: (duel) => clubNames.get(duel.attacking_club_id) },
    { key: 'attacker', header: 'Atacante', render: (duel) => <DuelPlayerCell player={duel.attacker} /> },
    { key: 'attack', header: 'Ataque', numeric: true, cellClassName: 'strong', render: (duel) => <DuelValue player={duel.attacker} /> },
    { key: 'defender', header: 'Defensor', render: (duel) => <DuelPlayerCell player={duel.defender} /> },
    { key: 'defense', header: 'Defesa', numeric: true, cellClassName: 'strong', render: (duel) => <DuelValue player={duel.defender} /> },
    {
      key: 'goal',
      header: 'Resultado',
      render: (duel) => <span className={`tag${duel.goal ? '' : ' tag-muted'}`}>{duel.goal ? 'Gol' : 'Sem gol'}</span>,
    },
  ]

  return (
    <section className="list-card" aria-labelledby="match-result-title">
      <div className="match-scoreboard">
        <ScoreSide side={match.home} role="Mandante" />
        <div className="match-score">
          <p id="match-result-title" className="match-score-value">{match.home.goals} × {match.away.goals}</p>
          <p className="cell-subtitle">{date}, {time}</p>
          <span className="tag">{MATCH_RESULT_LABELS[match.result]}</span>
        </div>
        <ScoreSide side={match.away} role="Visitante" />
      </div>
      <div className="list-card-header">
        <h2>Duelos</h2>
        <p>Os 3 ataques do mandante e depois os 3 do visitante, com os valores usados, já com o efeito da condição.</p>
      </div>
      <DataTable columns={columns} rows={match.duels} rowKey={(duel) => duel.order} />
    </section>
  )
}

function ScoreSide({ side, role }: { side: MatchSide; role: string }) {
  return (
    <div className="match-side">
      <p className="cell-title">{side.club_name}</p>
      <p className="cell-subtitle">{role} · {side.formation}</p>
    </div>
  )
}

function DuelPlayerCell({ player }: { player: DuelPlayer }) {
  return (
    <>
      <span className="cell-title">{player.player_name}</span>
      <span className="cell-subtitle">
        {player.position} <ConditionBadge condition={player.condition} />
      </span>
    </>
  )
}

function DuelValue({ player }: { player: DuelPlayer }) {
  return (
    <>
      <span className="cell-title">{player.value}</span>
      <span className="cell-subtitle">{DUEL_ATTRIBUTE_LABELS[player.attribute]}</span>
    </>
  )
}
