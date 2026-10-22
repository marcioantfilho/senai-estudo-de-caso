import { apiRequest } from '../../../shared/api/http-client'

/** Corpo de `POST /players/{id}/buy` (2.3.1); `loyalty_until` no formato da RN01. */
export type PurchaseOrder = {
  club_id: number
  loyalty_until: string
}

/** Formato de `POST /players/{id}/buy` (2.3.1), com o campo adicional `total_cost` (valor + taxa). */
export type Purchase = {
  id: number
  club_id: number
  player_id: number
  player_name: string
  type: 'COMPRA'
  value: number
  fee: number
  penalty: number
  profit: null
  cash_change: number
  created_at: string
  total_cost: number
  contract: { purchase_value: number; loyalty_until: string; status: string }
  club_cash: number
}

export function buyPlayer(playerId: number, order: PurchaseOrder): Promise<Purchase> {
  return apiRequest<Purchase>(`/players/${playerId}/buy`, { method: 'POST', body: order })
}
