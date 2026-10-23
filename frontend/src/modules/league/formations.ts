import type { Player, Position } from '../players/api/players-api'
import type { Formation } from './api/lineup-api'

export type Sector = 'GOL' | 'DEFESA' | 'MEIO' | 'ATAQUE'

/** RN19: posições aceitas em cada setor; o goleiro fica fora da conta da formação. */
const SECTOR_POSITIONS: Record<Sector, readonly Position[]> = {
  GOL: ['GOL'],
  DEFESA: ['ZAG', 'LAT'],
  MEIO: ['MEI'],
  ATAQUE: ['ATA'],
}

/** RN19: as 5 vagas de cada formação, do goleiro ao ataque. */
export const FORMATION_SLOTS: Record<Formation, readonly Sector[]> = {
  '3-1': ['GOL', 'DEFESA', 'DEFESA', 'DEFESA', 'ATAQUE'],
  '2-2': ['GOL', 'DEFESA', 'DEFESA', 'ATAQUE', 'ATAQUE'],
  '2-1-1': ['GOL', 'DEFESA', 'DEFESA', 'MEIO', 'ATAQUE'],
  '1-2-1': ['GOL', 'DEFESA', 'MEIO', 'MEIO', 'ATAQUE'],
}

export const FORMATION_DESCRIPTIONS: Record<Formation, string> = {
  '3-1': 'Defesa 3, ataque 1',
  '2-2': 'Defesa 2, ataque 2',
  '2-1-1': 'Defesa 2, meio 1, ataque 1',
  '1-2-1': 'Defesa 1, meio 2, ataque 1',
}

export const SECTOR_LABELS: Record<Sector, string> = {
  GOL: 'Goleiro',
  DEFESA: 'Defesa',
  MEIO: 'Meio',
  ATAQUE: 'Ataque',
}

export function sectorPositions(sector: Sector): readonly Position[] {
  return SECTOR_POSITIONS[sector]
}

export function fitsSector(player: Player, sector: Sector): boolean {
  return SECTOR_POSITIONS[sector].includes(player.position)
}

/** Distribui os jogadores escolhidos pelas vagas da formação, na ordem recebida; vaga sem jogador fica vazia. */
export function placeInSlots(formation: Formation, players: readonly Player[]): (number | undefined)[] {
  const used = new Set<number>()
  return FORMATION_SLOTS[formation].map((sector) => {
    const player = players.find((candidate) => !used.has(candidate.id) && fitsSector(candidate, sector))
    if (player) {
      used.add(player.id)
    }
    return player?.id
  })
}
