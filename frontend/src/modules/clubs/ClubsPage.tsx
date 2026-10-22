import { useState } from 'react'
import type { ClubSort } from './api/clubs-api'
import ClubDetailsView from './components/ClubDetailsView'
import ClubListView from './components/ClubListView'
import './clubs.css'

/** Lista de clubes e página do clube; ao voltar, a lista é lida de novo da API, na ordem escolhida. */
export default function ClubsPage() {
  const [sort, setSort] = useState<ClubSort>('name')
  const [openClubId, setOpenClubId] = useState<number | null>(null)

  if (openClubId !== null) {
    return <ClubDetailsView clubId={openClubId} onBack={() => setOpenClubId(null)} />
  }
  return <ClubListView sort={sort} onSortChange={setSort} onOpenClub={setOpenClubId} />
}
