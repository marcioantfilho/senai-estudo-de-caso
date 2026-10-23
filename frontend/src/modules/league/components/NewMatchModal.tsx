import { useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import FormField from '../../../shared/components/FormField'
import InlineAlert from '../../../shared/components/InlineAlert'
import Modal from '../../../shared/components/Modal'
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction'
import { useClubs } from '../../clubs/hooks/useClubs'
import { playMatch, type Match } from '../api/matches-api'
import { validateMatch, type MatchDraft, type MatchErrors } from '../match-validation'
import '../league.css'

const EMPTY_DRAFT: MatchDraft = { homeClubId: '', awayClubId: '' }

type NewMatchModalProps = {
  onClose: () => void
  onPlayed: (match: Match) => void
}

/** RN20: a tela envia a partida e mostra o `message` das recusas, inclusive o da escalação incompleta. */
export default function NewMatchModal({ onClose, onPlayed }: NewMatchModalProps) {
  const clubs = useClubs()
  const [draft, setDraft] = useState<MatchDraft>(EMPTY_DRAFT)
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string>()
  const { pending, run } = useAsyncAction()
  const errors: MatchErrors = submitted ? validateMatch(draft) : {}

  const update = (changes: Partial<MatchDraft>) => setDraft((current) => ({ ...current, ...changes }))

  const submit = () =>
    run(async () => {
      setSubmitted(true)
      setApiError(undefined)
      if (Object.values(validateMatch(draft)).some(Boolean)) {
        return
      }
      try {
        onPlayed(await playMatch({ home_club_id: Number(draft.homeClubId), away_club_id: Number(draft.awayClubId) }))
      } catch (error) {
        setApiError(error instanceof ApiError ? error.message : String(error))
      }
    })

  const clubSelect = (field: keyof MatchDraft) => ({ id, describedBy, invalid }: { id: string; describedBy: string | undefined; invalid: boolean }) => (
    <select id={id} value={draft[field]} aria-describedby={describedBy} aria-invalid={invalid}
      onChange={(event) => update({ [field]: event.target.value })}>
      <option value="">Selecione o clube</option>
      {clubs.map((club) => (
        <option key={club.id} value={club.id}>{club.name} ({club.acronym})</option>
      ))}
    </select>
  )

  return (
    <Modal
      title="Nova partida"
      description="Escolha o mandante e o visitante. O placar sai dos atributos dos titulares, sem sorteio."
      onClose={onClose}
      footer={
        <>
          <p className="footer-note">Os dois clubes precisam ter os 5 titulares escalados. A partida não mexe no caixa.</p>
          <button type="button" className="button button-secondary" disabled={pending} onClick={onClose}>Cancelar</button>
          <button type="submit" form="new-match-form" className="button button-primary" disabled={pending}>
            {pending ? 'Jogando…' : 'Jogar partida'}
          </button>
        </>
      }
    >
      <form
        id="new-match-form"
        className="match-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        {apiError && <InlineAlert tone="error" title="Não foi possível jogar a partida">{apiError}</InlineAlert>}
        <FormField label="Mandante" error={errors.homeClubId} hint="Faz os 3 primeiros ataques.">
          {clubSelect('homeClubId')}
        </FormField>
        <FormField label="Visitante" error={errors.awayClubId} hint="Precisa ser um clube diferente do mandante.">
          {clubSelect('awayClubId')}
        </FormField>
      </form>
    </Modal>
  )
}
