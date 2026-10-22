import Modal from '../../../shared/components/Modal'
import { formatMoney } from '../../../shared/format/money'
import type { Player } from '../api/players-api'
import { POSITION_LABELS } from '../player-labels'

type PlayerCreatedModalProps = {
  player: Player
  onShowDetails: () => void
  onClose: () => void
}

/** F04: valor base, valor de mercado e overall como a API devolveu no cadastro. */
export default function PlayerCreatedModal({ player, onShowDetails, onClose }: PlayerCreatedModalProps) {
  return (
    <Modal
      title="Jogador cadastrado"
      size="small"
      description={`${player.name} entrou livre e Apto. Valores em moedas, calculados pela API ao salvar.`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onShowDetails}>Ver detalhes</button>
          <button type="button" className="button button-primary" onClick={onClose}>Fechar</button>
        </>
      }
    >
      <dl className="value-list">
        <div>
          <dt>Valor base<span>Calculado no cadastro; não muda depois</span></dt>
          <dd className="value-highlight">{formatMoney(player.base_value)}</dd>
        </div>
        <div>
          <dt>Valor de mercado<span>Com condição, agilidade e idade</span></dt>
          <dd>{formatMoney(player.market_value)}</dd>
        </div>
        <div>
          <dt>Overall<span>Pelos pesos da posição {POSITION_LABELS[player.position]}</span></dt>
          <dd>{player.overall}</dd>
        </div>
      </dl>
    </Modal>
  )
}
