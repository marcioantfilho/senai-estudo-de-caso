import { useEffect, useState } from 'react'
import { listClubTransactions } from '../api/market-api'

export type TransactionParticipant = { id: number; name: string }

const NO_FILTER = { types: [] }

/**
 * Jogadores que aparecem no histórico do clube, inclusive os que já saíram do elenco,
 * com o nome da transação mais recente; vazio enquanto carrega ou se a consulta falhar.
 */
export function useTransactionParticipants(clubId: number) {
  const [participants, setParticipants] = useState<TransactionParticipant[]>([])

  useEffect(() => {
    const controller = new AbortController()
    listClubTransactions(clubId, NO_FILTER, controller.signal)
      .then(({ data }) => {
        const byId = new Map<number, string>()
        for (const transaction of data) {
          if (!byId.has(transaction.player_id)) {
            byId.set(transaction.player_id, transaction.player_name)
          }
        }
        setParticipants([...byId].map(([id, name]) => ({ id, name })))
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [clubId])

  return participants
}
