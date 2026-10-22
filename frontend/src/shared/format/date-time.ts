const API_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):\d{2}-03:00$/

export function formatDateTime(value: string): { date: string; time: string } {
  const match = API_DATE_TIME.exec(value)
  if (!match) {
    return { date: value, time: '' }
  }
  const [, year, month, day, hour, minute] = match
  return { date: `${day}/${month}/${year}`, time: `${hour}:${minute}` }
}
