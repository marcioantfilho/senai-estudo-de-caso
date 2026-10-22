import DataTable, { type Column } from '../../../shared/components/DataTable'
import { formatMoney } from '../../../shared/format/money'
import type { Club } from '../api/clubs-api'

type ClubTableProps = {
  clubs: Club[]
  onOpenClub: (clubId: number) => void
}

/** Linhas na ordem devolvida por `GET /clubs`. */
export default function ClubTable({ clubs, onOpenClub }: ClubTableProps) {
  const columns: Column<Club>[] = [
    {
      key: 'name',
      header: 'Clube',
      render: (club) => (
        <span className="club-name-cell">
          <span className="acronym-avatar" aria-hidden="true">{club.acronym}</span>
          <span className="cell-title">{club.name}</span>
        </span>
      ),
    },
    { key: 'acronym', header: 'Sigla', render: (club) => <span className="tag">{club.acronym}</span> },
    { key: 'cash', header: 'Caixa', numeric: true, render: (club) => formatMoney(club.cash) },
    { key: 'squad_value', header: 'Valor do elenco', numeric: true, render: (club) => formatMoney(club.squad_value) },
    { key: 'net_worth', header: 'Patrimônio', numeric: true, cellClassName: 'strong', render: (club) => formatMoney(club.net_worth) },
    {
      key: 'actions',
      header: <span className="visually-hidden">Ações</span>,
      cellClassName: 'actions-cell',
      render: (club) => (
        <button type="button" className="button button-ghost" onClick={() => onOpenClub(club.id)}>
          Ver clube ›
        </button>
      ),
    },
  ]

  return <DataTable columns={columns} rows={clubs} rowKey={(club) => club.id} />
}
