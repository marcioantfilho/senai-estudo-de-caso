import type { Key, ReactNode } from 'react'
import './components.css'

export type Column<Row> = {
  key: string
  header: ReactNode
  numeric?: boolean
  cellClassName?: string
  render: (row: Row) => ReactNode
}

type DataTableProps<Row> = {
  columns: readonly Column<Row>[]
  rows: readonly Row[]
  rowKey: (row: Row) => Key
}

/** Tabela das telas de lista; as linhas seguem a ordem recebida, sem reordenar. */
export default function DataTable<Row>({ columns, rows, rowKey }: DataTableProps<Row>) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={column.numeric ? 'numeric' : undefined}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key} className={cellClassName(column)}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function cellClassName<Row>({ numeric, cellClassName: extra }: Column<Row>): string | undefined {
  return [numeric ? 'numeric' : undefined, extra].filter(Boolean).join(' ') || undefined
}
