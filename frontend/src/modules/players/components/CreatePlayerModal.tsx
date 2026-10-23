import { useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import FormField from '../../../shared/components/FormField'
import InlineAlert from '../../../shared/components/InlineAlert'
import Modal from '../../../shared/components/Modal'
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction'
import { normalizeName } from '../../../shared/validation/text'
import { registerPlayer, type Player, type Position } from '../api/players-api'
import { ATTRIBUTE_LABELS, type AttributeField } from '../player-labels'
import { AGE_RANGE, AGILITY_RANGE, ATTRIBUTE_RANGE, validateInteger, validateName } from '../player-validation'
import IntegerField from './IntegerField'
import PositionPicker from './PositionPicker'

const ATTRIBUTE_FIELDS: AttributeField[] = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical', 'potential']

type Draft = { name: string; position: Position | undefined; age: string; agility: string } & Record<AttributeField, string>

type DraftErrors = Partial<Record<keyof Draft, string>>

const EMPTY_DRAFT: Draft = {
  name: '',
  position: undefined,
  age: '',
  agility: '',
  pace: '',
  shooting: '',
  passing: '',
  dribbling: '',
  defending: '',
  physical: '',
  potential: '',
}

/** Campos obrigatórios, tamanho do nome e faixas de um campo só; as regras que cruzam campos ficam na API. */
function validate(draft: Draft): DraftErrors {
  const errors: DraftErrors = {
    name: validateName(draft.name),
    position: draft.position ? undefined : 'Escolha a posição.',
    age: validateInteger(draft.age, AGE_RANGE, 'Informe a idade.'),
    agility: validateInteger(draft.agility, AGILITY_RANGE, 'Informe a agilidade.'),
  }
  for (const field of ATTRIBUTE_FIELDS) {
    errors[field] = validateInteger(draft[field], ATTRIBUTE_RANGE, `Informe um valor de ${ATTRIBUTE_RANGE.min} a ${ATTRIBUTE_RANGE.max}.`)
  }
  return errors
}

type CreatePlayerModalProps = {
  onClose: () => void
  onCreated: (player: Player) => void
}

export default function CreatePlayerModal({ onClose, onCreated }: CreatePlayerModalProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string>()
  const { pending, run } = useAsyncAction()
  const errors = submitted ? validate(draft) : {}
  const hasErrors = Object.values(errors).some(Boolean)

  const update = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }))

  const submit = () =>
    run(async () => {
      setSubmitted(true)
      setApiError(undefined)
      if (Object.values(validate(draft)).some(Boolean) || !draft.position) {
        return
      }
      try {
        const player = await registerPlayer({
          name: normalizeName(draft.name),
          position: draft.position,
          age: Number(draft.age),
          agility: Number(draft.agility),
          pace: Number(draft.pace),
          shooting: Number(draft.shooting),
          passing: Number(draft.passing),
          dribbling: Number(draft.dribbling),
          defending: Number(draft.defending),
          physical: Number(draft.physical),
          potential: Number(draft.potential),
        })
        onCreated(player)
      } catch (error) {
        setApiError(error instanceof ApiError ? error.message : String(error))
      }
    })

  return (
    <Modal
      title="Novo jogador"
      size="large"
      description={
        hasErrors
          ? 'Corrija os campos destacados para salvar.'
          : 'Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao salvar.'
      }
      onClose={onClose}
      footer={
        <>
          <p className="footer-note">O jogador começa livre e Apto.</p>
          <button type="button" className="button button-secondary" disabled={pending} onClick={onClose}>Cancelar</button>
          <button type="submit" form="create-player-form" className="button button-primary" disabled={pending}>
            {pending ? 'Salvando…' : 'Salvar jogador'}
          </button>
        </>
      }
    >
      <form
        id="create-player-form"
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
        <PositionPicker value={draft.position} error={errors.position} onChange={(position) => update({ position })} />
        <div className="form-grid form-grid-3">
          <IntegerField label="Idade" value={draft.age} error={errors.age} hint="De 16 a 45 anos." onChange={(age) => update({ age })} />
          <IntegerField label="Agilidade" value={draft.agility} error={errors.agility} hint="De 1 a 100 (até 85 com 35 anos ou mais)."
            onChange={(agility) => update({ agility })} />
          <CalculatedField label="Valor base (moedas)" hint="Calculado no cadastro." />
        </div>

        <h3 className="form-section-title">Indicadores técnicos</h3>
        <p className="form-section-description">
          Seis atributos e o potencial, de 1 a 99. Não mudam depois do cadastro; a soma dos seis atributos não pode passar de 480.
        </p>
        <div className="form-grid form-grid-4">
          {ATTRIBUTE_FIELDS.map((field) => (
            <IntegerField
              key={field}
              label={ATTRIBUTE_LABELS[field]}
              value={draft[field]}
              error={errors[field]}
              hint={field === 'potential' ? '≥ maior atributo; igual a ele com 33+ anos.' : undefined}
              onChange={(value) => update({ [field]: value })}
            />
          ))}
          <CalculatedField label="Overall" hint="Calculado automaticamente." />
        </div>
        {apiError && <InlineAlert tone="error" title="Não foi possível salvar">{apiError}</InlineAlert>}
      </form>
    </Modal>
  )
}

function CalculatedField({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="form-field">
      <span className="form-field-label">{label}</span>
      <span className="calculated-field">Após salvar</span>
      <p className="field-hint">{hint}</p>
    </div>
  )
}
