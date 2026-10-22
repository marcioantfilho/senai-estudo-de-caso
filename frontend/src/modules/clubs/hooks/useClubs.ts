import { useEffect, useState } from 'react'
import { listClubs, type Club } from '../api/clubs-api'

/** Clubes de `GET /clubs`, na ordem devolvida pela API; vazio enquanto carrega ou se falhar. */
export function useClubs() {
  const [clubs, setClubs] = useState<Club[]>([])

  useEffect(() => {
    const controller = new AbortController()
    listClubs('name', controller.signal)
      .then(setClubs)
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  return clubs
}
