import { StandingRow } from '../domain/standings';

/** Formato de cada linha de `GET /standings` (2.4.3). */
export interface StandingResponse {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export function toStandingResponse(row: StandingRow): StandingResponse {
  return {
    position: row.position,
    club_id: row.clubId,
    club_name: row.clubName,
    played: row.played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goals_for: row.goalsFor,
    goals_against: row.goalsAgainst,
    goal_difference: row.goalDifference,
    points: row.points,
  };
}
