import { formatBrasiliaDateTime } from '../../../shared/http/brasilia-date-time';
import { Duel, DuelSide, MatchSide, MatchSummary, RecordedMatch } from '../domain/match';

interface MatchSideResponse {
  club_id: number;
  club_name: string;
  formation: string;
  goals: number;
}

interface DuelSideResponse {
  player_id: number;
  player_name: string;
  position: string;
  condition: string;
  attribute: string;
  value: number;
}

interface DuelResponse {
  order: number;
  attacking_club_id: number;
  attacker: DuelSideResponse;
  defender: DuelSideResponse;
  goal: boolean;
}

/** Formato de cada item de `GET /matches`: a partida sem os duelos (2.4.2). */
export interface MatchSummaryResponse {
  id: number;
  played_at: string;
  home: MatchSideResponse;
  away: MatchSideResponse;
  result: string;
}

/** Formato de `POST /matches` e `GET /matches/{id}` (2.4.2). */
export interface MatchResponse extends MatchSummaryResponse {
  duels: DuelResponse[];
}

export function toMatchSummaryResponse(match: MatchSummary): MatchSummaryResponse {
  return {
    id: match.id,
    played_at: formatBrasiliaDateTime(match.playedAt),
    home: toSideResponse(match.home),
    away: toSideResponse(match.away),
    result: match.result,
  };
}

export function toMatchResponse(match: RecordedMatch): MatchResponse {
  return { ...toMatchSummaryResponse(match), duels: match.duels.map(toDuelResponse) };
}

function toSideResponse(side: MatchSide): MatchSideResponse {
  return { club_id: side.clubId, club_name: side.clubName, formation: side.formation, goals: side.goals };
}

function toDuelResponse(duel: Duel): DuelResponse {
  return {
    order: duel.order,
    attacking_club_id: duel.attackingClubId,
    attacker: toDuelSideResponse(duel.attacker),
    defender: toDuelSideResponse(duel.defender),
    goal: duel.goal,
  };
}

function toDuelSideResponse(side: DuelSide): DuelSideResponse {
  return {
    player_id: side.playerId,
    player_name: side.playerName,
    position: side.position,
    condition: side.condition,
    attribute: side.attribute,
    value: side.value,
  };
}
