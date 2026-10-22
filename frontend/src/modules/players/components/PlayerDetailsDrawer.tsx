import { useEffect } from 'react'
import { ErrorState, LoadingState } from '../../../shared/components/ListState'
import { formatMoney } from '../../../shared/format/money'
import type { Club } from '../../clubs/api/clubs-api'
import type { Player } from '../api/players-api'
import { usePlayerDetails } from '../hooks/usePlayerDetails'
import { ATTRIBUTE_LABELS } from '../player-labels'
import { ATTRIBUTE_RANGE } from '../player-validation'
import ConditionBadge from './ConditionBadge'

const ATTRIBUTES = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'] as const

type PlayerDetailsDrawerProps = {
  playerId: number
  version: number
  clubs: readonly Club[]
  onEdit: (player: Player) => void
  onChangeCondition: (player: Player) => void
  onClose: () => void
}

/** Painel com `GET /players/{id}`: valores, indicadores e ações do jogador. */
export default function PlayerDetailsDrawer({ playerId, version, clubs, onEdit, onChangeCondition, onClose }: PlayerDetailsDrawerProps) {
  const state = usePlayerDetails(playerId, version)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Detalhes do jogador">
        <button type="button" className="icon-button drawer-close" aria-label="Fechar" onClick={onClose}>×</button>
        {state.status === 'loading' && <LoadingState label="Carregando jogador…" rows={4} />}
        {state.status === 'error' && <ErrorState title="Não foi possível carregar o jogador" description={state.message} />}
        {state.status === 'ready' && (
          <PlayerDetails player={state.player} clubs={clubs} onEdit={onEdit} onChangeCondition={onChangeCondition} />
        )}
      </aside>
    </div>
  )
}

type PlayerDetailsProps = Pick<PlayerDetailsDrawerProps, 'clubs' | 'onEdit' | 'onChangeCondition'> & { player: Player }

function PlayerDetails({ player, clubs, onEdit, onChangeCondition }: PlayerDetailsProps) {
  const club = clubs.find(({ id }) => id === player.club_id)

  return (
    <>
      <header className="drawer-header">
        <h2>{player.name}</h2>
        <div className="drawer-tags">
          <span className="tag">{player.position}</span>
          <ConditionBadge condition={player.condition} />
          <span className="tag tag-muted">{club ? club.acronym : 'Livre'}</span>
        </div>
      </header>

      <div className="stat-grid">
        <Stat label="Valor de mercado" value={formatMoney(player.market_value)} note="Calculado automaticamente" />
        <Stat label="Valor base" value={formatMoney(player.base_value)} note="Calculado no cadastro" />
        <Stat label="Overall" value={String(player.overall)} note="Calculado pela posição" />
        <Stat label="Potencial" value={String(player.potential)} note="Informado no cadastro" />
      </div>

      <section aria-labelledby="indicators-title">
        <div className="section-heading">
          <h3 id="indicators-title">Indicadores técnicos</h3>
          <span className="muted">Escala de {ATTRIBUTE_RANGE.min} a {ATTRIBUTE_RANGE.max}</span>
        </div>
        <ul className="attribute-bars">
          {ATTRIBUTES.map((attribute) => (
            <li key={attribute}>
              <span>{ATTRIBUTE_LABELS[attribute]}</span>
              <span className="attribute-track" aria-hidden="true">
                <span className="attribute-fill" style={{ width: `${player[attribute]}%` }} />
              </span>
              <span className="numeric">{player[attribute]}</span>
            </li>
          ))}
        </ul>
      </section>

      <dl className="detail-list">
        <div><dt>Idade</dt><dd>{player.age} anos</dd></div>
        <div><dt>Agilidade</dt><dd>{player.agility}</dd></div>
        <div><dt>Clube</dt><dd>{club ? club.name : 'Livre'}</dd></div>
      </dl>

      <footer className="drawer-footer">
        <button type="button" className="button button-secondary" onClick={() => onEdit(player)}>Editar</button>
        <button type="button" className="button button-secondary" onClick={() => onChangeCondition(player)}>Alterar condição</button>
      </footer>
    </>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="stat">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className="stat-note">{note}</p>
    </div>
  )
}
