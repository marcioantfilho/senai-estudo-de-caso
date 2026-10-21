import { PhysicalCondition } from '../../players/domain/physical-condition';
import { Position } from '../../players/domain/position';

export const FORMATIONS = ['3-1', '2-2', '2-1-1', '1-2-1'] as const;

export type Formation = (typeof FORMATIONS)[number];

export const LINEUP_SIZE = 5;

type Sector = 'goal' | 'defense' | 'midfield' | 'attack';

type SectorCounts = Record<Sector, number>;

/** RN19: defesa (ZAG ou LAT), meio (MEI) e ataque (ATA); o goleiro fica fora da formação. */
const POSITION_SECTOR: Record<Position, Sector> = {
  GOL: 'goal',
  ZAG: 'defense',
  LAT: 'defense',
  MEI: 'midfield',
  ATA: 'attack',
};

/** RN19: 1 goleiro e os 4 jogadores de linha de cada setor. */
const FORMATION_SECTORS: Record<Formation, SectorCounts> = {
  '3-1': { goal: 1, defense: 3, midfield: 0, attack: 1 },
  '2-2': { goal: 1, defense: 2, midfield: 0, attack: 2 },
  '2-1-1': { goal: 1, defense: 2, midfield: 1, attack: 1 },
  '1-2-1': { goal: 1, defense: 1, midfield: 2, attack: 1 },
};

/** RN19: as posições dos titulares fecham exatamente os setores da formação. */
export function fitsFormation(positions: readonly Position[], formation: Formation): boolean {
  const counts: SectorCounts = { goal: 0, defense: 0, midfield: 0, attack: 0 };
  for (const position of positions) {
    counts[POSITION_SECTOR[position]]++;
  }
  const required = FORMATION_SECTORS[formation];
  return (Object.keys(required) as Sector[]).every((sector) => counts[sector] === required[sector]);
}

/** RN19: jogador DOENTE não é escalado e sai da escalação ao adoecer. */
export function canBeStarter(condition: PhysicalCondition): boolean {
  return condition !== 'DOENTE';
}

export function isLineupComplete(starterCount: number): boolean {
  return starterCount === LINEUP_SIZE;
}
