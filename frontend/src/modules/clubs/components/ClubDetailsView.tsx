import { EmptyState, ErrorState, LoadingState } from '../../../shared/components/ListState'
import { formatMoney } from '../../../shared/format/money'
import type { ClubDetails } from '../api/clubs-api'
import { SQUAD_LIMIT } from '../club-labels'
import { useClubDetails } from '../hooks/useClubDetails'
import SquadTable from './SquadTable'

type ClubDetailsViewProps = {
  clubId: number
  onBack: () => void
}

export default function ClubDetailsView({ clubId, onBack }: ClubDetailsViewProps) {
  const { state, reload } = useClubDetails(clubId)
  const backButton = (
    <button type="button" className="button button-secondary" onClick={onBack}>‹ Voltar para clubes</button>
  )

  return (
    <section aria-labelledby="club-title">
      <button type="button" className="link-button back-link" onClick={onBack}>‹ Clubes</button>
      {state.status === 'ready' ? (
        <ClubOverview club={state.club} />
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
    </section>
  )
}

/** Caixa, valor do elenco, patrimônio e elenco como devolvidos por `GET /clubs/{id}`. */
function ClubOverview({ club }: { club: ClubDetails }) {
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
            <SquadTable players={club.players} />
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
