import { useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import FormField from '../../../shared/components/FormField'
import InlineAlert from '../../../shared/components/InlineAlert'
import Modal from '../../../shared/components/Modal'
import { formatMoney } from '../../../shared/format/money'
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction'
import { normalizeName } from '../../../shared/validation/text'
import { updatePlayer, type Player, type Position } from '../api/players-api'
import { AGE_RANGE, AGILITY_RANGE, validateInteger, validateName } from '../player-validation'
import IntegerField from './IntegerField'
import PositionPicker from './PositionPicker'

type Draft = { name: string; position: Position; age: string; agility: string }

type EditPlayerModalProps = {
  player: Player
  onClose: () => void
  onSaved: (player: Player) => void
}

/** RN08: edita só nome, posição, idade e agilidade. */
export default function EditPlayerModal({ player, onClose, onSaved }: EditPlayerModalProps) {
  const [draft, setDraft] = useState<Draft>({
    name: player.name,
    position: player.position,
    age: String(player.age),
    agility: String(player.agility),
  })
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string>()
  const { pending, run } = useAsyncAction()
  const hasClub = player.club_id !== null
  const errors = submitted ? validate(draft, player.age) : {}

  const update = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }))

  const submit = () =>
    run(async () => {
      setSubmitted(true)
      setApiError(undefined)
      if (Object.values(validate(draft, player.age)).some(Boolean)) {
        return
      }
      try {
        onSaved(
          await updatePlayer(player.id, {
            name: normalizeName(draft.name),
            position: draft.position,
            age: Number(draft.age),
            agility: Number(draft.agility),
          }),
        )
      } catch (error) {
        setApiError(error instanceof ApiError ? error.message : String(error))
      }
    })

  return (
    <Modal
      title="Editar jogador"
      description="Edite nome, posição, idade e agilidade. Os demais dados não mudam."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button-secondary" disabled={pending} onClick={onClose}>Cancelar</button>
          <button type="submit" form="edit-player-form" className="button button-primary" disabled={pending}>
            {pending ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </>
      }
    >
      <form
        id="edit-player-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <FormField label="Nome" error={errors.name} hint="De 3 a 100 caracteres, com pelo menos duas palavras e sem números.">
          {({ id, describedBy, invalid }) => (
            <input id={id} value={draft.name} aria-describedby={describedBy} aria-invalid={invalid}
              onChange={(event) => update({ name: event.target.value })} />
          )}
        </FormField>
        <PositionPicker
          value={draft.position}
          lockedTo={hasClub ? player.position : undefined}
          hint={hasClub ? 'Jogador com clube não muda de posição: as outras posições ficam desabilitadas.' : undefined}
          onChange={(position) => update({ position })}
        />
        <div className="form-grid form-grid-2">
          <IntegerField label="Idade" value={draft.age} error={errors.age} hint={`De 16 a 45, sem diminuir (atual: ${player.age}).`}
            onChange={(age) => update({ age })} />
          <IntegerField label="Agilidade" value={draft.agility} error={errors.agility} hint="De 1 a 100 (até 85 com 35 anos ou mais)."
            onChange={(agility) => update({ agility })} />
        </div>
        <p className="locked-note">
          Não mudam depois do cadastro: valor base ({formatMoney(player.base_value)}), indicadores e potencial.
        </p>
        {apiError && <InlineAlert tone="error" title="Não foi possível salvar">{apiError}</InlineAlert>}
      </form>
    </Modal>
  )
}

function validate(draft: Draft, currentAge: number): Partial<Record<keyof Draft, string>> {
  const ageError = validateInteger(draft.age, AGE_RANGE, 'Informe a idade.')
  return {
    name: validateName(draft.name),
    age: ageError ?? (Number(draft.age) < currentAge ? `A idade não pode ser menor que a atual (${currentAge}).` : undefined),
    agility: validateInteger(draft.agility, AGILITY_RANGE, 'Informe a agilidade.'),
  }
}
