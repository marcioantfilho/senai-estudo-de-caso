import { useCallback, useState } from 'react'
import Dropdown from '../../../shared/components/Dropdown'
import { EmptyState, ErrorState, LoadingState } from '../../../shared/components/ListState'
import { formatMoney } from '../../../shared/format/money'
import { useToast } from '../../../shared/hooks/useToast'
import { CLUB_SORTS, type Club, type ClubSort } from '../api/clubs-api'
import { CLUB_SORT_LABELS, MAX_CLUBS } from '../club-labels'
import { useClubList } from '../hooks/useClubList'
import ClubTable from './ClubTable'
import CreateClubModal from './CreateClubModal'

type ClubListViewProps = {
  sort: ClubSort
  onSortChange: (sort: ClubSort) => void
  onOpenClub: (clubId: number) => void
}

export default function ClubListView({ sort, onSortChange, onOpenClub }: ClubListViewProps) {
  const [creating, setCreating] = useState(false)
  const { state, reload } = useClubList(sort)
  const showToast = useToast()
  const closeCreate = useCallback(() => setCreating(false), [])
  const isEmpty = state.status === 'ready' && state.clubs.length === 0

  const handleCreated = (club: Club) => {
    setCreating(false)
    showToast({
      tone: 'success',
      title: 'Clube criado',
      description: `${club.name} (${club.acronym}) começa com ${formatMoney(club.cash)} em caixa.`,
    })
    onOpenClub(club.id)
  }

  return (
    <section aria-labelledby="clubs-title">
      <header className="page-header">
        <div>
          <h1 id="clubs-title">Clubes</h1>
          <p className="module-description">
            Cada clube começa com 300,00 em caixa e sem jogadores. A liga aceita no máximo {MAX_CLUBS} clubes.
          </p>
        </div>
        <button type="button" className="button button-primary" onClick={() => setCreating(true)}>
          + Novo clube
        </button>
      </header>

      <div className="list-card">
        {!isEmpty && (
          <div className="list-toolbar">
            {state.status === 'ready' ? <ClubCount total={state.clubs.length} /> : <span />}
            <Dropdown label={`Ordenar: ${CLUB_SORT_LABELS[sort].toLowerCase()}`} align="end">
              {(close) => (
                <ul className="menu-list" role="listbox" aria-label="Ordenar por">
                  <li className="menu-heading">Ordenar por</li>
                  {CLUB_SORTS.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={option === sort}
                        className="menu-item"
                        onClick={() => {
                          onSortChange(option)
                          close()
                        }}
                      >
                        {CLUB_SORT_LABELS[option]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Dropdown>
          </div>
        )}
        {state.status === 'loading' && <LoadingState label="Carregando clubes…" />}
        {state.status === 'error' && (
          <ErrorState
            title="Não foi possível carregar os clubes"
            description={state.message}
            action={<button type="button" className="button button-secondary" onClick={reload}>Tentar de novo</button>}
          />
        )}
        {isEmpty && (
          <EmptyState
            title="Nenhum clube cadastrado"
            description="Crie o primeiro clube com nome e sigla. Ele começa com 300,00 em caixa e sem jogadores."
            action={<button type="button" className="button button-secondary" onClick={() => setCreating(true)}>+ Novo clube</button>}
          />
        )}
        {state.status === 'ready' && state.clubs.length > 0 && <ClubTable clubs={state.clubs} onOpenClub={onOpenClub} />}
      </div>
      <p className="list-footnote">Clubes pelo nome por padrão ou pelo patrimônio, com empate desfeito pelo nome.</p>

      {creating && <CreateClubModal onClose={closeCreate} onCreated={handleCreated} />}
    </section>
  )
}

function ClubCount({ total }: { total: number }) {
  return (
    <p className="club-count">
      <strong>{total === 1 ? '1 clube' : `${total} clubes`}</strong>
      <span className="tag tag-muted">{total} de {MAX_CLUBS}</span>
    </p>
  )
}
