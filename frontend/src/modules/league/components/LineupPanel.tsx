import { useState } from 'react'
import DataTable, { type Column } from '../../../shared/components/DataTable'
import InlineAlert from '../../../shared/components/InlineAlert'
import { EmptyState, ErrorState, LoadingState } from '../../../shared/components/ListState'
import { useToast } from '../../../shared/hooks/useToast'
import ConditionBadge from '../../players/components/ConditionBadge'
import type { Player } from '../../players/api/players-api'
import { POSITION_LABELS } from '../../players/player-labels'
import type { Lineup } from '../api/lineup-api'
import { useLineup } from '../hooks/useLineup'
import LineupForm from './LineupForm'
import '../league.css'

type LineupPanelProps = {
  clubId: number
  clubName: string
  squad: readonly Player[]
}

/** F12: a escalação devolvida pela API e o formulário para escalar de novo. */
export default function LineupPanel({ clubId, clubName, squad }: LineupPanelProps) {
  const { state, reload, show } = useLineup(clubId)
  const [formKey, setFormKey] = useState(0)
  const showToast = useToast()

  const handleSaved = (lineup: Lineup) => {
    show(lineup)
    setFormKey((key) => key + 1)
    showToast({
      tone: 'success',
      title: 'Escalação salva',
      description: `${clubName} na ${lineup.formation}, com os titulares devolvidos pela API.`,
    })
  }

  if (state.status === 'loading') {
    return <div className="list-card"><LoadingState label="Carregando a escalação…" /></div>
  }
  if (state.status === 'error') {
    return (
      <div className="list-card">
        <ErrorState
          title="Não foi possível carregar a escalação"
          description={state.message}
          action={<button type="button" className="button button-secondary" onClick={reload}>Tentar de novo</button>}
        />
      </div>
    )
  }

  const { lineup } = state
  return (
    <div className="lineup-panel">
      <div className="list-card">
        <div className="list-card-header lineup-header">
          <div>
            <h2>Escalação atual</h2>
            <p>Titulares na ordem do elenco, como devolvidos pela API.</p>
          </div>
          <p className="club-tags">
            <span className="tag">{lineup.formation ?? 'Sem formação'}</span>
            <span className={`tag${lineup.complete ? '' : ' tag-muted'}`}>{lineup.complete ? 'Completa' : 'Incompleta'}</span>
          </p>
        </div>
        {!lineup.complete && (
          <div className="lineup-warning">
            <InlineAlert tone="warning" title={`Escalação incompleta: o ${clubName} não pode jogar partidas`}>
              {lineup.formation
                ? 'Um titular saiu por venda ou por ficar Doente. Escale de novo os 5 titulares; quem se recuperar não volta sozinho.'
                : 'O clube ainda não tem escalação. Escolha a formação e um titular para cada uma das 5 vagas.'}
            </InlineAlert>
          </div>
        )}
        {lineup.players.length > 0 ? (
          <StarterTable players={lineup.players} />
        ) : (
          <EmptyState title="Nenhum titular escalado" description="Os titulares aparecem aqui depois de salvar a escalação." />
        )}
      </div>

      <div className="list-card">
        <div className="list-card-header">
          <h2>Escalar titulares</h2>
          <p>1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar troca os 5 de uma vez.</p>
        </div>
        <LineupForm key={formKey} clubId={clubId} lineup={lineup} squad={squad} onSaved={handleSaved} />
      </div>
    </div>
  )
}

function StarterTable({ players }: { players: Player[] }) {
  const columns: Column<Player>[] = [
    {
      key: 'name',
      header: 'Jogador',
      render: (player) => (
        <>
          <span className="cell-title">{player.name}</span>
          <span className="cell-subtitle">{POSITION_LABELS[player.position]}</span>
        </>
      ),
    },
    { key: 'position', header: 'Posição', render: (player) => <span className="tag">{player.position}</span> },
    { key: 'condition', header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
    { key: 'overall', header: 'Overall', numeric: true, cellClassName: 'strong', render: (player) => player.overall },
  ]

  return <DataTable columns={columns} rows={players} rowKey={(player) => player.id} />
}
