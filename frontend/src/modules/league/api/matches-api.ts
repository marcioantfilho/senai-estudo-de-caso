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

/** Item de `GET /matches`: a partida sem os duelos (2.4.2). */
export type MatchSummary = Omit<Match, 'duels'>

/** Item de `GET /standings` (2.4.3), calculado pela API a cada consulta (RN21). */
export type Standing = {
  position: number
  club_id: number
  club_name: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

export function listMatches(clubId: number | undefined, signal?: AbortSignal): Promise<MatchSummary[]> {
  return apiRequest<MatchSummary[]>('/matches', { query: { club_id: clubId }, signal })
}

export function getMatch(id: number, signal?: AbortSignal): Promise<Match> {
  return apiRequest<Match>(`/matches/${id}`, { signal })
}

export function getStandings(signal?: AbortSignal): Promise<Standing[]> {
  return apiRequest<Standing[]>('/standings', { signal })
}
