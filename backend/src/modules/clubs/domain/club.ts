import { sumMoney } from '../../../shared/domain/money';
import { PlayerDetails } from '../../players/domain/player';

/** RN10: caixa inicial e limite de clubes da liga. */
export const INITIAL_CASH = 300;
export const MAX_CLUBS = 20;

export interface ClubRegistration {
  name: string;
  acronym: string;
}

export interface NewClub extends ClubRegistration {
  cash: number;
}

export interface Club extends NewClub {
  id: number;
}

export interface ClubSummary extends Club {
  squadValue: number;
  netWorth: number;
}

/** RN10: o clube nasce com 300,00 em caixa, sem jogadores e sem escalação. */
export function createClub(registration: ClubRegistration): NewClub {
  return { ...registration, cash: INITIAL_CASH };
}

/** RN11: valor do elenco e patrimônio, calculados a cada consulta. */
export function summarizeClub(club: Club, squad: readonly PlayerDetails[]): ClubSummary {
  const squadValue = sumMoney(squad.map((player) => player.marketValue));
  return { ...club, squadValue, netWorth: sumMoney([club.cash, squadValue]) };
}
