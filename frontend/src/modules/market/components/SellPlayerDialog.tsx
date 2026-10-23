import { useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import InlineAlert from '../../../shared/components/InlineAlert'
import Modal from '../../../shared/components/Modal'
import { formatDateTime } from '../../../shared/format/date-time'
import { formatMoney } from '../../../shared/format/money'
import { formatInteger } from '../../../shared/format/number'
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction'
import type { SquadMember } from '../../clubs/api/clubs-api'
import { useIsStarter } from '../../league/hooks/useIsStarter'
import PlayerSummary from '../../players/components/PlayerSummary'
import { sellPlayer, type Sale } from '../api/market-api'
import '../market.css'

type SellPlayerDialogProps = {
  player: SquadMember
  clubName: string
  onClose: () => void
  onSold: (sale: Sale, wasStarter: boolean) => void
  onRefused: () => void
}

/** RN15 e RN16: confirmação antes da venda; multa, lucro, comissão e crédito vêm da resposta da API. */
export default function SellPlayerDialog({ player, clubName, onClose, onSold, onRefused }: SellPlayerDialogProps) {
  const [apiError, setApiError] = useState<string>()
  const { pending, run } = useAsyncAction()
  const isStarter = useIsStarter(player.club_id, player.id)
  const loyaltyUntil = formatDateTime(player.contract.loyalty_until)

  const confirm = () =>
    run(async () => {
      setApiError(undefined)
      try {
        onSold(await sellPlayer(player.id), isStarter)
      } catch (error) {
        setApiError(error instanceof ApiError ? error.message : String(error))
        onRefused()
      }
    })

  return (
    <Modal
      title={`Vender ${player.name}?`}
      size="small"
      description={`O jogador sai do elenco do ${clubName} e volta a ficar livre.`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button-secondary" disabled={pending} onClick={onClose}>Cancelar</button>
          <button type="button" className="button button-danger" disabled={pending} onClick={() => void confirm()}>
            {pending ? 'Vendendo…' : 'Confirmar venda'}
          </button>
        </>
      }
    >
      <div className="sale-dialog">
        {apiError && <InlineAlert tone="error" title="A venda foi recusada">{apiError}</InlineAlert>}
        <PlayerSummary player={player} />
        <dl className="value-list">
          <div>
            <dt>Valor de mercado</dt>
            <dd>{formatMoney(player.market_value)}</dd>
          </div>
          <div>
            <dt>Valor de compra</dt>
            <dd>{formatMoney(player.contract.purchase_value)}</dd>
          </div>
          <div>
            <dt>Fim da fidelidade<span>Horário de Brasília</span></dt>
            <dd>{loyaltyUntil.date}, {loyaltyUntil.time}</dd>
          </div>
          <div>
            <dt>Dias restantes</dt>
            <dd>{formatInteger(player.contract.remaining_days)}</dd>
          </div>
          <div>
            <dt>% de multa se vender agora</dt>
            <dd><span className="tag">{player.contract.penalty_rate}%</span></dd>
          </div>
        </dl>
        {isStarter && (
          <InlineAlert tone="warning" title={`${player.name} é titular`}>
            Ao vender, ele sai da escalação, e o {clubName} só volta a jogar partidas depois de escalar de novo os 5 titulares.
          </InlineAlert>
        )}
        <p className="locked-note">
          A venda é pelo valor de mercado do momento. Multa (teto de 10,00), lucro, comissão e crédito são calculados ao confirmar.
        </p>
      </div>
    </Modal>
  )
}
