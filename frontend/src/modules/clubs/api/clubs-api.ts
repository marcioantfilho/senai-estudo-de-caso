import { apiRequest } from '../../../shared/api/http-client'

/** Campos mínimos de cada clube (2.2). */
export type Club = {
  id: number
  name: string
  acronym: string
  cash: number
  squad_value: number
  net_worth: number
}

export function listClubs(signal?: AbortSignal): Promise<Club[]> {
  return apiRequest<Club[]>('/clubs', { signal })
}
