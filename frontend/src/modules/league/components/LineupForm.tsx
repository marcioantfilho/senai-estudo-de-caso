import { useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import FormField from '../../../shared/components/FormField'
import InlineAlert from '../../../shared/components/InlineAlert'
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction'
import type { Player } from '../../players/api/players-api'
import { CONDITION_LABELS } from '../../players/player-labels'
import { FORMATIONS, saveLineup, type Formation, type Lineup } from '../api/lineup-api'
import { fitsSector, FORMATION_DESCRIPTIONS, FORMATION_SLOTS, placeInSlots, SECTOR_LABELS, sectorPositions } from '../formations'
import { hasLineupErrors, validateLineup, type LineupDraft } from '../lineup-validation'

const EMPTY_SLOTS: (number | undefined)[] = Array.from({ length: 5 }, () => undefined)

function draftFrom(lineup: Lineup): LineupDraft {
  const formation = lineup.formation ?? undefined
  return { formation, slots: formation ? placeInSlots(formation, lineup.players) : EMPTY_SLOTS }
}

type LineupFormProps = {
  clubId: number
  lineup: Lineup
  squad: readonly Player[]
  onSaved: (lineup: Lineup) => void
}

/** F12: formação e um titular por vaga, entre os jogadores do elenco sem `DOENTE`; o `PUT` troca os 5 de uma vez. */
export default function LineupForm({ clubId, lineup, squad, onSaved }: LineupFormProps) {
  const [draft, setDraft] = useState<LineupDraft>(() => draftFrom(lineup))
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string>()
  const { pending, run } = useAsyncAction()
  const errors = submitted ? validateLineup(draft) : { slots: [] }
  const chosen = squad.filter(({ id }) => draft.slots.includes(id))
  const unfit = chosen.filter(({ condition }) => condition === 'MAL_CONDICIONADO')

  const chooseFormation = (formation: Formation) => setDraft({ formation, slots: placeInSlots(formation, chosen) })

  const choosePlayer = (index: number, playerId: number | undefined) =>
    setDraft((current) => ({ ...current, slots: current.slots.map((slot, position) => (position === index ? playerId : slot)) }))

  const submit = () =>
    run(async () => {
      setSubmitted(true)
      setApiError(undefined)
      const { formation, slots } = draft
      if (!formation || hasLineupErrors(validateLineup(draft))) {
        return
      }
      try {
        onSaved(await saveLineup(clubId, { formation, player_ids: slots.filter((id) => id !== undefined) }))
      } catch (error) {
        setApiError(error instanceof ApiError ? error.message : String(error))
      }
    })

  return (
    <form
      className="lineup-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      {apiError && <InlineAlert tone="error" title="Não foi possível salvar a escalação">{apiError}</InlineAlert>}

      <fieldset className="choice-list lineup-formations" aria-describedby="formation-message">
        <legend className="form-field-label">Formação</legend>
        <p id="formation-message" className={errors.formation ? 'field-error' : 'field-hint'} role={errors.formation ? 'alert' : undefined}>
          {errors.formation ?? 'Os números contam os jogadores de linha de trás para frente. O goleiro fica fora da conta.'}
        </p>
        {FORMATIONS.map((formation) => (
          <label key={formation} className={`choice${draft.formation === formation ? ' is-selected' : ''}`}>
            <input type="radio" name="formation" value={formation} checked={draft.formation === formation}
              onChange={() => chooseFormation(formation)} />
            <span>
              <span className="choice-title">{formation}</span>
              <span className="choice-description">{FORMATION_DESCRIPTIONS[formation]}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {draft.formation && (
        <div className="lineup-slots">
          {FORMATION_SLOTS[draft.formation].map((sector, index) => {
            const options = squad.filter((player) => fitsSector(player, sector))
            const selected = squad.find(({ id }) => id === draft.slots[index])
            return (
              <FormField
                key={`${draft.formation}-${index}`}
                label={`${SECTOR_LABELS[sector]} (${sectorPositions(sector).join(' ou ')})`}
                error={errors.slots[index]}
                hint={selected
                  ? `${CONDITION_LABELS[selected.condition]} · overall ${selected.overall}`
                  : options.length === 0 ? `Sem ${sectorPositions(sector).join(' ou ')} no elenco.` : undefined}
              >
                {({ id, describedBy, invalid }) => (
                  <select id={id} value={draft.slots[index] ?? ''} aria-describedby={describedBy} aria-invalid={invalid}
                    onChange={(event) => choosePlayer(index, event.target.value ? Number(event.target.value) : undefined)}>
                    <option value="">Selecione o titular</option>
                    {options.map((player) => (
                      <option key={player.id} value={player.id} disabled={player.condition === 'DOENTE'}>
                        {player.name} ({player.position}){player.condition === 'DOENTE' ? ' · Doente, não pode ser escalado' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
            )
          })}
        </div>
      )}

      {unfit.length > 0 && (
        <InlineAlert tone="warning" title={`${unfit.map(({ name }) => name).join(' e ')} ${unfit.length > 1 ? 'estão mal condicionados' : 'está mal condicionado'}`}>
          Podem jogar, mas cada atributo vale 15% a menos durante a partida.
        </InlineAlert>
      )}

      <div className="lineup-actions">
        <p className="footer-note">
          A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube só volta a jogar depois de escalar de novo.
        </p>
        <button type="button" className="button button-secondary" disabled={pending}
          onClick={() => { setDraft(draftFrom(lineup)); setSubmitted(false); setApiError(undefined) }}>
          Cancelar
        </button>
        <button type="submit" className="button button-primary" disabled={pending}>
          {pending ? 'Salvando…' : 'Salvar escalação'}
        </button>
      </div>
    </form>
  )
}
