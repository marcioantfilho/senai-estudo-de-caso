import { formatBrasiliaDateTime } from '../../../shared/http/brasilia-date-time';
import { PlayerResponse, toPlayerResponse } from '../../players/http/player.response';
import { ClubSummary } from '../domain/club';
import { ClubDetails, SquadMember } from '../domain/club-squad';

/** Campos mínimos de cada clube (2.2), em snake_case. */
export interface ClubResponse {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface SquadMemberResponse extends PlayerResponse {
  contract: {
    purchase_value: number;
    loyalty_until: string;
    remaining_days: number;
    penalty_rate: number;
  };
}

export interface ClubDetailsResponse extends ClubResponse {
  players: SquadMemberResponse[];
}

export function toClubResponse(club: ClubSummary): ClubResponse {
  return {
    id: club.id,
    name: club.name,
    acronym: club.acronym,
    cash: club.cash,
    squad_value: club.squadValue,
    net_worth: club.netWorth,
  };
}

/** Formato de `GET /clubs/{id}` (2.2.2). */
export function toClubDetailsResponse(club: ClubDetails): ClubDetailsResponse {
  return { ...toClubResponse(club), players: club.squad.map(toSquadMemberResponse) };
}

function toSquadMemberResponse(member: SquadMember): SquadMemberResponse {
  const { contract } = member;
  return {
    ...toPlayerResponse(member),
    contract: {
      purchase_value: contract.purchaseValue,
      loyalty_until: formatBrasiliaDateTime(contract.loyaltyUntil),
      remaining_days: contract.remainingDays,
      penalty_rate: contract.penaltyRate,
    },
  };
}
