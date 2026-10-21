import { describePlayer, PlayerDetails } from '../../players/domain/player';
import { compareSquadOrder } from '../../players/domain/player-sort';
import { Formation, isLineupComplete } from '../domain/lineup';
import { StoredLineup } from './league.repository';

export interface LineupDetails {
  clubId: number;
  formation: Formation | null;
  complete: boolean;
  players: PlayerDetails[];
}

/** RN19: sem escalação, formação nula e lista vazia; incompleta mantém a formação salva. */
export function describeLineup({ clubId, formation, starters }: StoredLineup): LineupDetails {
  return {
    clubId,
    formation,
    complete: formation !== null && isLineupComplete(starters.length),
    players: starters.map(describePlayer).sort(compareSquadOrder),
  };
}
