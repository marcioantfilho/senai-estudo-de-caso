import Modal from '../../../shared/components/Modal'
import { formatMoney, formatSignedMoney } from '../../../shared/format/money'
import { formatInteger } from '../../../shared/format/number'
import type { Sale } from '../api/market-api'

type SaleResultModalProps = {
  sale: Sale
  clubName: string
  wasStarter: boolean
  onClose: () => void
}

/** F08: valor de compra, valor de venda, dias restantes, multa, lucro, comissão, crédito e novo caixa da resposta. */
export default function SaleResultModal({ sale, clubName, wasStarter, onClose }: SaleResultModalProps) {
  const description = wasStarter
    ? `${sale.player_name} voltou a ficar livre e saiu da escalação; o ${clubName} só joga depois de escalar de novo.`
    : `${sale.player_name} voltou a ficar livre.`

  return (
    <Modal
      title="Venda concluída"
      size="small"
      description={description}
      onClose={onClose}
      footer={<button type="button" className="button button-primary" onClick={onClose}>Fechar</button>}
    >
      <dl className="value-list">
        <div>
          <dt>Valor de compra<span>Gravado no contrato, sem a taxa</span></dt>
          <dd>{formatMoney(sale.purchase_value)}</dd>
        </div>
        <div>
          <dt>Valor de venda<span>Valor de mercado no momento da venda</span></dt>
          <dd>{formatMoney(sale.value)}</dd>
        </div>
        <div>
          <dt>Dias restantes<span>Da fidelidade, no momento da venda</span></dt>
          <dd>{formatInteger(sale.remaining_days)}</dd>
        </div>
        <div>
          <dt>Multa<span>{sale.penalty_rate}% do valor de venda, com teto de 10,00</span></dt>
          <dd>{formatMoney(sale.penalty)}</dd>
        </div>
        <div>
          <dt>Lucro<span>Valor de venda − valor de compra</span></dt>
          <dd>{formatSignedMoney(sale.profit)}</dd>
        </div>
        <div>
          <dt>Comissão<span>10% do lucro até 10,00 + 20% do que passar; sem lucro, sem comissão</span></dt>
          <dd>{formatMoney(sale.fee)}</dd>
        </div>
        <div>
          <dt>Crédito no caixa<span>Valor de venda − multa − comissão</span></dt>
          <dd>{formatSignedMoney(sale.cash_change)}</dd>
        </div>
        <div>
          <dt>Contrato</dt>
          <dd><span className="tag">{sale.contract_status}</span></dd>
        </div>
        <div>
          <dt>Novo caixa do {clubName}</dt>
          <dd className="value-highlight">{formatMoney(sale.club_cash)}</dd>
        </div>
      </dl>
    </Modal>
  )
}
