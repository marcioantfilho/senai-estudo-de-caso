import { useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import InlineAlert from '../../../shared/components/InlineAlert'
import Modal from '../../../shared/components/Modal'
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction'
import { useIsStarter } from '../../league/hooks/useIsStarter'
import { changePlayerCondition, CONDITIONS, type Condition, type Player } from '../api/players-api'
import { CONDITION_DESCRIPTIONS, CONDITION_LABELS } from '../player-labels'
import ConditionBadge from './ConditionBadge'
import PlayerSummary from './PlayerSummary'

const SICK_TO_FIT_REASON = 'De Doente não passa direto para Apto.'

type ChangeConditionModalProps = {
  player: Player
  clubName: string | undefined
  onClose: () => void
  onSaved: (player: Player) => void
}

export default function ChangeConditionModal({ player, clubName, onClose, onSaved }: ChangeConditionModalProps) {
  const [condition, setCondition] = useState<Condition>(player.condition)
  const [apiError, setApiError] = useState<string>()
  const { pending, run } = useAsyncAction()
  const isStarter = useIsStarter(player.club_id, player.id)

  const submit = () =>
    run(async () => {
      setApiError(undefined)
      try {
        onSaved(await changePlayerCondition(player.id, condition))
      } catch (error) {
        setApiError(error instanceof ApiError ? error.message : String(error))
      }
    })

  return (
    <Modal
      title="Alterar condição física"
      description="A condição muda o desconto do valor de mercado, recalculado ao salvar."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button-secondary" disabled={pending} onClick={onClose}>Cancelar</button>
          <button type="submit" form="change-condition-form" className="button button-primary" disabled={pending}>
            {pending ? 'Salvando…' : 'Salvar condição'}
          </button>
        </>
      }
    >
      <form
        id="change-condition-form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <PlayerSummary player={player} aside={<ConditionBadge condition={player.condition} />} />
        <fieldset className="choice-list">
          <legend className="visually-hidden">Nova condição</legend>
          {CONDITIONS.map((option) => {
            const blocked = player.condition === 'DOENTE' && option === 'APTO'
            return (
              <label key={option} className={`choice${condition === option ? ' is-selected' : ''}${blocked ? ' is-disabled' : ''}`}>
                <input
                  type="radio"
                  name="condition"
                  value={option}
                  checked={condition === option}
                  disabled={blocked}
                  onChange={() => setCondition(option)}
                />
                <span>
                  <span className="choice-title">
                    {CONDITION_LABELS[option]}
                    {option === player.condition && <span className="tag">Atual</span>}
                  </span>
                  <span className="choice-description">{CONDITION_DESCRIPTIONS[option]}</span>
                  {blocked && <span className="choice-description">{SICK_TO_FIT_REASON}</span>}
                </span>
              </label>
            )
          })}
        </fieldset>
        {condition === 'DOENTE' && player.condition !== 'DOENTE' && isStarter && (
          <InlineAlert tone="warning" title={`${player.name} é titular`}>
            Ao passar a Doente, ele sai da escalação, e o {clubName ?? 'clube'} só volta a jogar partidas depois de escalar de novo os 5 titulares.
          </InlineAlert>
        )}
        {apiError && <InlineAlert tone="error" title="Não foi possível alterar">{apiError}</InlineAlert>}
      </form>
    </Modal>
  )
}
