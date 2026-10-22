import { useCallback, useEffect, useMemo, useState } from 'react'
import { EmptyState, ErrorState, LoadingState } from '../../shared/components/ListState'
import { formatMoney } from '../../shared/format/money'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import { useToast } from '../../shared/hooks/useToast'
import { useClubs } from '../clubs/hooks/useClubs'
import type { Player, PlayerSort } from './api/players-api'
import ActiveFilterChips from './components/ActiveFilterChips'
import ChangeConditionModal from './components/ChangeConditionModal'
import CreatePlayerModal from './components/CreatePlayerModal'
import DeletePlayerDialog from './components/DeletePlayerDialog'
import EditPlayerModal from './components/EditPlayerModal'
import Pagination from './components/Pagination'
import PlayerCreatedModal from './components/PlayerCreatedModal'
import PlayerDetailsDrawer from './components/PlayerDetailsDrawer'
import PlayerFiltersBar from './components/PlayerFiltersBar'
import PlayerListToolbar from './components/PlayerListToolbar'
import PlayerTable, { type PlayerAction } from './components/PlayerTable'
import { usePlayerList } from './hooks/usePlayerList'
import { CONDITION_LABELS } from './player-labels'
import { activeFilterChips, EMPTY_FILTERS, toListQuery, type PlayerFilters } from './player-filters'
import './players.css'

const SEARCH_DELAY_MS = 300

type Dialog =
  | { type: 'create' }
  | { type: 'created'; player: Player }
  | { type: 'edit'; player: Player }
  | { type: 'condition'; player: Player }
  | { type: 'delete'; player: Player }

export default function PlayersPage() {
  const [filters, setFilters] = useState<PlayerFilters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<PlayerSort>('name')
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [detailsId, setDetailsId] = useState<number | null>(null)
  const [detailsVersion, setDetailsVersion] = useState(0)
  const showToast = useToast()
  const clubs = useClubs()
  const search = useDebouncedValue(filters.search, SEARCH_DELAY_MS)
  const query = useMemo(() => toListQuery({ ...filters, search }, sort, page), [filters, search, sort, page])
  const { state, reload } = usePlayerList(query)
  const chips = activeFilterChips(filters, clubs)
  const filtered = chips.length > 0 || filters.scope !== 'all'

  useEffect(() => {
    const meta = state.page?.meta
    if (state.status === 'ready' && meta && meta.total_pages > 0 && meta.page > meta.total_pages) {
      setPage(meta.total_pages)
    }
  }, [state])

  const changeFilters = (changes: Partial<PlayerFilters>) => {
    setFilters((current) => ({ ...current, ...changes }))
    setPage(1)
  }
  const clearFilters = () => changeFilters({ ...EMPTY_FILTERS, scope: filters.scope })
  const closeDialog = useCallback(() => setDialog(null), [])
  const closeDetails = useCallback(() => setDetailsId(null), [])

  const refresh = () => {
    reload()
    setDetailsVersion((version) => version + 1)
  }

  const handleAction = (action: PlayerAction, player: Player) => {
    if (action === 'details') {
      setDetailsId(player.id)
    } else {
      setDialog({ type: action, player })
    }
  }

  const handleCreated = (player: Player) => {
    refresh()
    setDialog({ type: 'created', player })
  }

  const handleEdited = (player: Player) => {
    refresh()
    setDialog(null)
    showToast({ tone: 'success', title: 'Jogador atualizado', description: `${player.name} foi salvo.` })
  }

  const handleConditionChanged = (player: Player) => {
    refresh()
    setDialog(null)
    showToast({
      tone: 'success',
      title: 'Condição alterada',
      description: `${player.name} agora está ${CONDITION_LABELS[player.condition]}. Valor de mercado: ${formatMoney(player.market_value)}.`,
    })
  }

  const handleDeleted = (player: Player) => {
    refresh()
    setDialog(null)
    if (detailsId === player.id) {
      setDetailsId(null)
    }
    showToast({
      tone: 'success',
      title: 'Jogador excluído',
      description: `${player.name} saiu da lista. Transações e partidas antigas dele continuam gravadas.`,
    })
  }

  return (
    <section className="players-page" aria-labelledby="players-title">
      <header className="page-header">
        <div>
          <h1 id="players-title">Jogadores</h1>
          <p className="module-description">Cadastre jogadores, acompanhe os indicadores e compre os que estão livres.</p>
        </div>
        <button type="button" className="button button-primary" onClick={() => setDialog({ type: 'create' })}>
          + Novo jogador
        </button>
      </header>

      <PlayerFiltersBar filters={filters} clubs={clubs} onChange={changeFilters} />
      <ActiveFilterChips chips={chips} onChange={changeFilters} onClearAll={clearFilters} />

      <div className="list-card">
        <PlayerListToolbar
          scope={filters.scope}
          clubSelected={filters.clubId !== undefined}
          sort={sort}
          onScopeChange={(scope) => changeFilters({ scope })}
          onSortChange={(next) => {
            setSort(next)
            setPage(1)
          }}
        />
        {state.status === 'loading' && <LoadingState label="Carregando jogadores…" rows={10} />}
        {state.status === 'error' && (
          <ErrorState
            title="Não foi possível carregar os jogadores"
            description={state.message}
            action={<button type="button" className="button button-secondary" onClick={reload}>Tentar de novo</button>}
          />
        )}
        {state.status === 'ready' && state.page.meta.total_items === 0 && (
          filtered ? (
            <EmptyState
              title="Nenhum jogador encontrado"
              description="Confira a grafia ou tire alguns filtros. A busca ignora maiúsculas, minúsculas e acentos."
              action={<button type="button" className="button button-secondary" onClick={() => changeFilters(EMPTY_FILTERS)}>Limpar filtros</button>}
            />
          ) : (
            <EmptyState
              title="Nenhum jogador cadastrado"
              description="Cadastre o primeiro jogador para começar."
              action={<button type="button" className="button button-secondary" onClick={() => setDialog({ type: 'create' })}>Novo jogador</button>}
            />
          )
        )}
        {state.status === 'ready' && state.page.data.length > 0 && (
          <>
            <PlayerTable players={state.page.data} clubs={clubs} onAction={handleAction} />
            <Pagination meta={state.page.meta} shownItems={state.page.data.length} onPageChange={setPage} />
          </>
        )}
      </div>

      {dialog?.type === 'create' && <CreatePlayerModal onClose={closeDialog} onCreated={handleCreated} />}
      {dialog?.type === 'created' && (
        <PlayerCreatedModal
          player={dialog.player}
          onClose={closeDialog}
          onShowDetails={() => {
            setDetailsId(dialog.player.id)
            setDialog(null)
          }}
        />
      )}
      {dialog?.type === 'edit' && <EditPlayerModal player={dialog.player} onClose={closeDialog} onSaved={handleEdited} />}
      {dialog?.type === 'condition' && (
        <ChangeConditionModal
          player={dialog.player}
          clubName={clubs.find(({ id }) => id === dialog.player.club_id)?.name}
          onClose={closeDialog}
          onSaved={handleConditionChanged}
        />
      )}
      {dialog?.type === 'delete' && <DeletePlayerDialog player={dialog.player} onClose={closeDialog} onDeleted={handleDeleted} />}
      {detailsId !== null && (
        <PlayerDetailsDrawer
          playerId={detailsId}
          version={detailsVersion}
          clubs={clubs}
          onEdit={(player) => setDialog({ type: 'edit', player })}
          onChangeCondition={(player) => setDialog({ type: 'condition', player })}
          onClose={closeDetails}
        />
      )}
    </section>
  )
}
