import { apiRequest } from '../../../shared/api/http-client'
import type { Condition, Position } from '../../players/api/players-api'
import type { Formation } from './lineup-api'

export type MatchResultType = 'MANDANTE' | 'VISITANTE' | 'EMPATE'

export type DuelAttribute = 'shooting' | 'passing' | 'dribbling' | 'defending'

/** Mandante ou visitante, com a formação e os gols gravados na partida. */
export type MatchSide = {
  club_id: number
  club_name: string
  formation: Formation
  goals: number
}

/** Jogador do duelo com o nome, a posição, a condição e o valor do momento, já com o efeito da condição. */
export type DuelPlayer = {
  player_id: number
  player_name: string
  position: Position
  condition: Condition
  attribute: DuelAttribute
  value: number
}

export type Duel = {
  order: number
  attacking_club_id: number
  attacker: DuelPlayer
  defender: DuelPlayer
  goal: boolean
}

/** Formato de `POST /matches` e `GET /matches/{id}` (2.4.2). */
export type Match = {
  id: number
  played_at: string
  home: MatchSide
  away: MatchSide
  result: MatchResultType
  duels: Duel[]
}

/** Corpo de `POST /matches`. */
export type MatchOrder = {
  home_club_id: number
  away_club_id: number
}

export function playMatch(order: MatchOrder): Promise<Match> {
  return apiRequest<Match>('/matches', { method: 'POST', body: order })
}
