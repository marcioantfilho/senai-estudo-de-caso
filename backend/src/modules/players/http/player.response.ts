import { PlayerDetails } from '../domain/player';

/** Formato de `GET /players/{id}` (2.1.2), em snake_case. */
export interface PlayerResponse {
  id: number;
  name: string;
  position: string;
  agility: number;
  age: number;
  condition: string;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
}

export function toPlayerResponse(player: PlayerDetails): PlayerResponse {
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    agility: player.agility,
    age: player.age,
    condition: player.condition,
    base_value: player.baseValue,
    market_value: player.marketValue,
    ...player.attributes,
    potential: player.potential,
    overall: player.overall,
    club_id: player.clubId,
  };
}
