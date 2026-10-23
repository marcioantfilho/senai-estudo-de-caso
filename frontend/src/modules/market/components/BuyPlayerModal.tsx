import { useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import FormField from '../../../shared/components/FormField'
import InlineAlert from '../../../shared/components/InlineAlert'
import Modal from '../../../shared/components/Modal'
import { formatMoney } from '../../../shared/format/money'
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction'
import type { Club } from '../../clubs/api/clubs-api'
import { useClubs } from '../../clubs/hooks/useClubs'
import type { Player } from '../../players/api/players-api'
import PlayerSummary from '../../players/components/PlayerSummary'
import { buyPlayer, type Purchase } from '../api/market-api'
import { toLoyaltyUntil, validatePurchase, type PurchaseDraft, type PurchaseErrors } from '../purchase-validation'
import '../market.css'

const EMPTY_DRAFT: PurchaseDraft = { clubId: '', loyaltyDate: '', loyaltyTime: '' }

type BuyPlayerModalProps = {
  player: Player
  onClose: () => void
  onBought: (purchase: Purchase, club: Club) => void
}

/** RN12 a RN14: a tela envia a compra e mostra o `message` das recusas; caixa, elenco e recompra ficam com a API. */
export default function BuyPlayerModal({ player, onClose, onBought }: BuyPlayerModalProps) {
  const clubs = useClubs()
  const [draft, setDraft] = useState<PurchaseDraft>(EMPTY_DRAFT)
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string>()
  const { pending, run } = useAsyncAction()
  const errors: PurchaseErrors = submitted ? validatePurchase(draft) : {}
  const club = clubs.find(({ id }) => String(id) === draft.clubId)

  const update = (changes: Partial<PurchaseDraft>) => setDraft((current) => ({ ...current, ...changes }))

  const submit = () =>
    run(async () => {
      setSubmitted(true)
      setApiError(undefined)
      if (!club || Object.values(validatePurchase(draft)).some(Boolean)) {
        return
      }
      try {
        const purchase = await buyPlayer(player.id, {
          club_id: club.id,
          loyalty_until: toLoyaltyUntil(draft.loyaltyDate, draft.loyaltyTime),
        })
        onBought(purchase, club)
      } catch (error) {
        setApiError(error instanceof ApiError ? error.message : String(error))
      }
    })

  return (
    <Modal
      title="Comprar jogador"
      description="Escolha o clube comprador e até quando vai a fidelidade do contrato."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button-secondary" disabled={pending} onClick={onClose}>Cancelar</button>
          <button type="submit" form="buy-player-form" className="button button-primary" disabled={pending}>
            {pending ? 'Comprando…' : 'Confirmar compra'}
          </button>
        </>
      }
    >
      <form
        id="buy-player-form"
        className="purchase-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        {apiError && <InlineAlert tone="error" title="Compra recusada">{apiError}</InlineAlert>}
        <PlayerSummary
          player={player}
          aside={
            <div className="purchase-market-value">
              <span className="cell-subtitle">Valor de mercado</span>
              <span className="cell-title">{formatMoney(player.market_value)}</span>
            </div>
          }
        />

        <FormField
          label="Clube comprador"
          error={errors.clubId}
          hint={club
            ? `Caixa atual: ${formatMoney(club.cash)}. O custo total (valor + taxa) pode ir até 50% do caixa.`
            : 'O custo total (valor + taxa) pode ir até 50% do caixa do clube.'}
        >
          {({ id, describedBy, invalid }) => (
            <select id={id} value={draft.clubId} aria-describedby={describedBy} aria-invalid={invalid}
              onChange={(event) => update({ clubId: event.target.value })}>
              <option value="">Selecione o clube</option>
              {clubs.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} ({option.acronym}) · caixa {formatMoney(option.cash)}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <fieldset className="purchase-loyalty">
          <legend className="form-field-label">Fim da fidelidade</legend>
          <div className="form-grid form-grid-2">
            <FormField label="Data" error={errors.loyaltyDate}>
              {({ id, describedBy, invalid }) => (
                <input id={id} type="date" value={draft.loyaltyDate} aria-describedby={describedBy} aria-invalid={invalid}
                  onChange={(event) => update({ loyaltyDate: event.target.value })} />
              )}
            </FormField>
            <FormField label="Hora" error={errors.loyaltyTime}>
              {({ id, describedBy, invalid }) => (
                <input id={id} type="time" value={draft.loyaltyTime} aria-describedby={describedBy} aria-invalid={invalid}
                  onChange={(event) => update({ loyaltyTime: event.target.value })} />
              )}
            </FormField>
          </div>
          <p className="field-hint">
            Depois do momento da compra e até 1.095 dias. Horário de Brasília; enviado com o fuso (-03:00).
          </p>
        </fieldset>

        <p className="locked-note">
          A taxa é de 5% do valor de mercado, só quando ele passa de 30,00. Taxa, custo e novo caixa são calculados ao confirmar.
        </p>
      </form>
    </Modal>
  )
}
