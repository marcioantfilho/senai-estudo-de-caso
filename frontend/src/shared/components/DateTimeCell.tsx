import { formatDateTime } from '../format/date-time'

/** Data e hora devolvidas pela API em `-03:00`, numa célula de tabela: DD/MM/AAAA e HH:MM. */
export default function DateTimeCell({ value }: { value: string }) {
  const { date, time } = formatDateTime(value)
  return (
    <>
      <span className="cell-title">{date}</span>
      <span className="cell-subtitle">{time}</span>
    </>
  )
}
