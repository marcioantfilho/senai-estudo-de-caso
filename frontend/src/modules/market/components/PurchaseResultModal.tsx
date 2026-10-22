import Modal from '../../../shared/components/Modal'
import { formatDateTime } from '../../../shared/format/date-time'
import { formatMoney } from '../../../shared/format/money'
import type { Club } from '../../clubs/api/clubs-api'
import type { Purchase } from '../api/market-api'

type PurchaseResultModalProps = {
  purchase: Purchase
  club: Club
  onClose: () => void
}

/** F06: valor, taxa, custo total, fim da fidelidade e novo caixa como a API devolveu na compra. */
export default function PurchaseResultModal({ purchase, club, onClose }: PurchaseResultModalProps) {
  const loyaltyUntil = formatDateTime(purchase.contract.loyalty_until)

  return (
    <Modal
      title="Compra concluída"
      size="small"
      description={`${purchase.player_name} agora é do ${club.name}.`}
      onClose={onClose}
      footer={<button type="button" className="button button-primary" onClick={onClose}>Fechar</button>}
    >
      <dl className="value-list">
        <div>
          <dt>Valor<span>Valor de mercado no momento da compra</span></dt>
          <dd>{formatMoney(purchase.value)}</dd>
        </div>
        <div>
          <dt>Taxa<span>5% do valor, quando ele passa de 30,00</span></dt>
          <dd>{formatMoney(purchase.fee)}</dd>
        </div>
        <div>
          <dt>Custo total<span>Valor + taxa</span></dt>
          <dd className="value-highlight">{formatMoney(purchase.total_cost)}</dd>
        </div>
        <div>
          <dt>Fim da fidelidade<span>Horário de Brasília</span></dt>
          <dd>{loyaltyUntil.date}, {loyaltyUntil.time}</dd>
        </div>
        <div>
          <dt>Contrato</dt>
          <dd><span className="tag">{purchase.contract.status}</span></dd>
        </div>
        <div>
          <dt>Novo caixa do {club.name}</dt>
          <dd className="value-highlight">{formatMoney(purchase.club_cash)}</dd>
        </div>
      </dl>
    </Modal>
  )
}
