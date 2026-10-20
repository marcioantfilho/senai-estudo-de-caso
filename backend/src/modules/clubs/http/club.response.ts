import { ClubSummary } from '../domain/club';

/** Campos mínimos de cada clube (2.2), em snake_case. */
export interface ClubResponse {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
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
