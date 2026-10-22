import type { PlayerPage } from '../api/players-api'

type PaginationProps = {
  meta: PlayerPage['meta']
  shownItems: number
  onPageChange: (page: number) => void
}

/** Mostra a página e os totais do `meta` devolvido pela API. */
export default function Pagination({ meta, shownItems, onPageChange }: PaginationProps) {
  const { page, limit, total_items: totalItems, total_pages: totalPages } = meta
  const first = shownItems === 0 ? 0 : (page - 1) * limit + 1
  const last = shownItems === 0 ? 0 : first + shownItems - 1
  const noun = totalItems === 1 ? 'jogador' : 'jogadores'

  return (
    <nav className="pagination" aria-label="Paginação">
      <p>Mostrando {first}–{last} de {totalItems} {noun}</p>
      <div className="pagination-controls">
        <button type="button" className="button button-ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ‹ Anterior
        </button>
        {visiblePages(page, totalPages).map((number, index, pages) => (
          <span key={number} className="page-group">
            {index > 0 && number - (pages[index - 1] ?? number) > 1 && <span aria-hidden="true">…</span>}
            <button
              type="button"
              className="page-button"
              aria-current={number === page ? 'page' : undefined}
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          </span>
        ))}
        <button type="button" className="button button-ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Próxima ›
        </button>
      </div>
    </nav>
  )
}

const PAGE_WINDOW = 2

/** Primeira, última e as páginas próximas da atual. */
function visiblePages(page: number, totalPages: number): number[] {
  const pages = new Set([1, totalPages])
  for (let number = page - PAGE_WINDOW; number <= page + PAGE_WINDOW; number++) {
    pages.add(number)
  }
  return [...pages].filter((number) => number >= 1 && number <= totalPages).sort((left, right) => left - right)
}
