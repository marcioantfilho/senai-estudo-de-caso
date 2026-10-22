import { useCallback, useState } from 'react'
import { EmptyState, ErrorState, LoadingState } from '../../../shared/components/ListState'
import { formatMoney } from '../../../shared/format/money'
import type { Sale } from '../../market/api/market-api'
import SaleResultModal from '../../market/components/SaleResultModal'
import SellPlayerDialog from '../../market/components/SellPlayerDialog'
import type { ClubDetails, SquadMember } from '../api/clubs-api'
import { SQUAD_LIMIT } from '../club-labels'
import { useClubDetails } from '../hooks/useClubDetails'
import SquadTable from './SquadTable'

type ClubDetailsViewProps = {
  clubId: number
  onBack: () => void
}

type Dialog =
  | { type: 'sell'; player: SquadMember; clubName: string }
  | { type: 'sold'; sale: Sale; clubName: string; wasStarter: boolean }

export default function ClubDetailsView({ clubId, onBack }: ClubDetailsViewProps) {
  const { state, reload } = useClubDetails(clubId)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const closeDialog = useCallback(() => setDialog(null), [])

  const handleSold = (sale: Sale, wasStarter: boolean) => {
    reload()
    setDialog((current) => current && { type: 'sold', sale, clubName: current.clubName, wasStarter })
  }

  const backButton = (
    <button type="button" className="button button-secondary" onClick={onBack}>‹ Voltar para clubes</button>
  )

  return (
    <section aria-labelledby="club-title">
      <button type="button" className="link-button back-link" onClick={onBack}>‹ Clubes</button>
      {state.status === 'ready' ? (
        <ClubOverview
          club={state.club}
          onSell={(player) => setDialog({ type: 'sell', player, clubName: state.club.name })}
        />
      ) : (
        <div className="list-card">
          {state.status === 'loading' && <LoadingState label="Carregando o elenco…" />}
          {state.status === 'error' && state.notFound && (
            <EmptyState title="Clube não encontrado" description={state.message} action={backButton} />
          )}
          {state.status === 'error' && !state.notFound && (
            <ErrorState
              title="Não foi possível carregar o elenco"
              description={state.message}
              action={<button type="button" className="button button-secondary" onClick={reload}>Tentar de novo</button>}
            />
          )}
        </div>
      )}

      {dialog?.type === 'sell' && (
        <SellPlayerDialog
          player={dialog.player}
          clubName={dialog.clubName}
          onClose={closeDialog}
          onSold={handleSold}
          onRefused={reload}
        />
      )}
      {dialog?.type === 'sold' && (
        <SaleResultModal sale={dialog.sale} clubName={dialog.clubName} wasStarter={dialog.wasStarter} onClose={closeDialog} />
      )}
    </section>
  )
}

type ClubOverviewProps = {
  club: ClubDetails
  onSell: (player: SquadMember) => void
}

/** Caixa, valor do elenco, patrimônio e elenco como devolvidos por `GET /clubs/{id}`. */
function ClubOverview({ club, onSell }: ClubOverviewProps) {
  const squadSize = `${club.players.length} de ${SQUAD_LIMIT}`

  return (
    <>
      <header className="page-header">
        <div className="club-heading">
          <span className="acronym-avatar acronym-avatar-large" aria-hidden="true">{club.acronym}</span>
          <div>
            <h1 id="club-title">{club.name}</h1>
            <p className="club-tags">
              <span className="tag">Sigla {club.acronym}</span>
              <span className="tag">{squadSize} jogadores</span>
            </p>
          </div>
        </div>
      </header>

      <dl className="club-stats">
        <ClubStat label="Caixa" value={formatMoney(club.cash)} unit="moedas" note="Só muda por compras e vendas" />
        <ClubStat label="Valor do elenco" value={formatMoney(club.squad_value)} unit="moedas" note="Soma dos valores de mercado" />
        <ClubStat label="Patrimônio" value={formatMoney(club.net_worth)} unit="moedas" note="Caixa + valor do elenco" />
        <ClubStat label="Elenco" value={squadSize} note={`Limite de ${SQUAD_LIMIT} jogadores`} />
      </dl>

      <div className="list-card">
        {club.players.length === 0 ? (
          <EmptyState
            title="Nenhum jogador no elenco"
            description={`Compre jogadores livres para montar o elenco. O limite é de ${SQUAD_LIMIT} jogadores, e o custo de cada compra não pode passar de 50% do caixa.`}
          />
        ) : (
          <>
            <div className="list-card-header">
              <h2>Elenco</h2>
              <p>Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome. Contrato calculado para uma venda agora.</p>
            </div>
            <SquadTable players={club.players} onSell={onSell} />
          </>
        )}
      </div>
      <p className="list-footnote">
        Valor de mercado, dias restantes e % de multa calculados pela API para uma venda agora. A multa tem teto de 10,00.
      </p>
    </>
  )
}

type ClubStatProps = {
  label: string
  value: string
  unit?: string
  note: string
}

function ClubStat({ label, value, unit, note }: ClubStatProps) {
  return (
    <div className="club-stat">
      <dt>{label}</dt>
      <dd>
        <span className="club-stat-value">{value}</span>
        {unit && <span className="club-stat-unit"> {unit}</span>}
        <span className="club-stat-note">{note}</span>
      </dd>
    </div>
  )
}
