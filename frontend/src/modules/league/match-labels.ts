import { ATTRIBUTE_LABELS } from '../players/player-labels'
import type { DuelAttribute, MatchResultType } from './api/matches-api'

export const MATCH_RESULT_LABELS: Record<MatchResultType, string> = {
  MANDANTE: 'Vitória do mandante',
  VISITANTE: 'Vitória do visitante',
  EMPATE: 'Empate',
}

export const DUEL_ATTRIBUTE_LABELS: Record<DuelAttribute, string> = {
  shooting: ATTRIBUTE_LABELS.shooting,
  passing: ATTRIBUTE_LABELS.passing,
  dribbling: ATTRIBUTE_LABELS.dribbling,
  defending: ATTRIBUTE_LABELS.defending,
}
