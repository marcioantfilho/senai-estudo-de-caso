import { PlayerResponse, toPlayerResponse } from '../../players/http/player.response';
import { LineupDetails } from '../application/lineup-details';

/** Formato de `GET` e `PUT /clubs/{id}/lineup` (2.4.1). */
export interface LineupResponse {
  club_id: number;
  formation: string | null;
  complete: boolean;
  players: PlayerResponse[];
}

export function toLineupResponse(lineup: LineupDetails): LineupResponse {
  return {
    club_id: lineup.clubId,
    formation: lineup.formation,
    complete: lineup.complete,
    players: lineup.players.map(toPlayerResponse),
  };
}
