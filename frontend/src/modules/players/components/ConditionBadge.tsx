import type { Condition } from '../api/players-api'
import { CONDITION_LABELS } from '../player-labels'

export default function ConditionBadge({ condition }: { condition: Condition }) {
  return <span className={`badge badge-condition-${condition.toLowerCase()}`}>{CONDITION_LABELS[condition]}</span>
}
