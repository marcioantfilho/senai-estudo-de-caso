import { useState } from 'react'
import { ApiError } from '../../../shared/api/http-client'
import InlineAlert from '../../../shared/components/InlineAlert'
import Modal from '../../../shared/components/Modal'
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction'
import { deletePlayer, type Player } from '../api/players-api'
import { POSITION_LABELS } from '../player-labels'

type DeletePlayerDialogProps = {
  player: Player
  onClose: () => void
  onDeleted: (player: Player) => void
}

/** RN09: confirmação da exclusão lógica de um jogador livre. */
export default function DeletePlayerDialog({ player, onClose, onDeleted }: DeletePlayerDialogProps) {
  const [apiError, setApiError] = useState<string>()
  const { pending, run } = useAsyncAction()

  const confirm = () =>
    run(async () => {
      setApiError(undefined)
      try {
        await deletePlayer(player.id)
        onDeleted(player)
      } catch (error) {
        setApiError(error instanceof ApiError ? error.message : String(error))
      }
    })

  return (
    <Modal
      title={`Excluir ${player.name}?`}
      size="small"
      description="O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam como foram gravadas."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="button button-danger" disabled={pending} onClick={() => void confirm()}>
            {pending ? 'Excluindo…' : 'Excluir jogador'}
          </button>
        </>
      }
    >
      <div className="player-summary">
        <div>
          <p className="cell-title">{player.name}</p>
          <p className="cell-subtitle">{player.position} · {POSITION_LABELS[player.position]} · {player.age} anos</p>
        </div>
        <span className="tag tag-muted">Livre</span>
      </div>
      {apiError && <InlineAlert tone="error" title="Não foi possível excluir">{apiError}</InlineAlert>}
    </Modal>
  )
}
