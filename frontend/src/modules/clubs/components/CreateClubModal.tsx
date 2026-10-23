import { useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import FormField from '../../../shared/components/FormField'
import InlineAlert from '../../../shared/components/InlineAlert'
import Modal from '../../../shared/components/Modal'
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction'
import { normalizeName } from '../../../shared/validation/text'
import { createClub, type Club, type ClubRegistration } from '../api/clubs-api'
import { validateAcronym, validateClubName } from '../club-validation'

type DraftErrors = Partial<Record<keyof ClubRegistration, string>>

const EMPTY_DRAFT: ClubRegistration = { name: '', acronym: '' }

function validate(draft: ClubRegistration): DraftErrors {
  return { name: validateClubName(draft.name), acronym: validateAcronym(draft.acronym) }
}

type CreateClubModalProps = {
  onClose: () => void
  onCreated: (club: Club) => void
}

export default function CreateClubModal({ onClose, onCreated }: CreateClubModalProps) {
  const [draft, setDraft] = useState<ClubRegistration>(EMPTY_DRAFT)
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string>()
  const { pending, run } = useAsyncAction()
  const errors = submitted ? validate(draft) : {}

  const update = (changes: Partial<ClubRegistration>) => setDraft((current) => ({ ...current, ...changes }))

  const submit = () =>
    run(async () => {
      setSubmitted(true)
      setApiError(undefined)
      if (Object.values(validate(draft)).some(Boolean)) {
        return
      }
      try {
        onCreated(await createClub({ name: normalizeName(draft.name), acronym: draft.acronym }))
      } catch (error) {
        setApiError(error instanceof ApiError ? error.message : String(error))
      }
    })

  return (
    <Modal
      title="Novo clube"
      description="Informe o nome e a sigla do clube."
      onClose={onClose}
      footer={
        <>
          <p className="footer-note">O clube começa com 300,00 em caixa e sem jogadores.</p>
          <button type="button" className="button button-secondary" disabled={pending} onClick={onClose}>Cancelar</button>
          <button type="submit" form="create-club-form" className="button button-primary" disabled={pending}>
            {pending ? 'Criando…' : 'Criar clube'}
          </button>
        </>
      }
    >
      <form
        id="create-club-form"
        className="create-club-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        {apiError && <InlineAlert tone="error" title="Não foi possível criar o clube">{apiError}</InlineAlert>}
        <FormField
          label="Nome"
          error={errors.name}
          hint="De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube."
        >
          {({ id, describedBy, invalid }) => (
            <input id={id} value={draft.name} aria-describedby={describedBy} aria-invalid={invalid}
              onChange={(event) => update({ name: event.target.value })} />
          )}
        </FormField>
        <FormField
          label="Sigla"
          error={errors.acronym}
          hint="3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome."
        >
          {({ id, describedBy, invalid }) => (
            <input id={id} value={draft.acronym} aria-describedby={describedBy} aria-invalid={invalid}
              onChange={(event) => update({ acronym: event.target.value })} />
          )}
        </FormField>
      </form>
    </Modal>
  )
}
