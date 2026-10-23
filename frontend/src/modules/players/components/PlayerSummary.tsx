import type { ReactNode } from 'react'
import type { Player } from '../api/players-api'
import { POSITION_LABELS } from '../player-labels'

type PlayerSummaryProps = {
  player: Pick<Player, 'name' | 'position' | 'age'>
  aside?: ReactNode
}

/** Cabeçalho dos diálogos de um jogador: nome, posição e idade, com um destaque à direita. */
export default function PlayerSummary({ player, aside }: PlayerSummaryProps) {
  return (
    <div className="player-summary">
      <div>
        <p className="cell-title">{player.name}</p>
        <p className="cell-subtitle">{player.position} · {POSITION_LABELS[player.position]} · {player.age} anos</p>
      </div>
      {aside}
    </div>
  )
}
