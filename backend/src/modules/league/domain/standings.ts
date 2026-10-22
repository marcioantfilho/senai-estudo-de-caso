import { chainComparators, Comparator } from '../../../shared/domain/comparison';
import { compareAlphabetically } from '../../../shared/domain/text-comparison';

/** RN21: vitória 3, empate 1, derrota 0. */
const WIN_POINTS = 3;
const DRAW_POINTS = 1;

export interface LeagueClub {
  id: number;
  name: string;
}

export interface MatchScore {
  homeClubId: number;
  awayClubId: number;
  homeGoals: number;
  awayGoals: number;
}

export interface StandingRow {
  position: number;
  clubId: number;
  clubName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

type Tally = Omit<StandingRow, 'position'>;

/** RN21: mais pontos, maior saldo, mais gols marcados, nome (Premissas) e, no empate de nomes, id. */
const standingOrder: Comparator<Tally> = chainComparators<Tally>([
  (left, right) => right.points - left.points,
  (left, right) => right.goalDifference - left.goalDifference,
  (left, right) => right.goalsFor - left.goalsFor,
  (left, right) => compareAlphabetically(left.clubName, right.clubName),
  (left, right) => left.clubId - right.clubId,
]);

/** RN21: calculada a cada consulta, com todos os clubes, inclusive os que ainda não jogaram. */
export function computeStandings(clubs: readonly LeagueClub[], matches: readonly MatchScore[]): StandingRow[] {
  const tallies = new Map(clubs.map((club) => [club.id, emptyTally(club)]));
  for (const match of matches) {
    record(tallies.get(match.homeClubId), match.homeGoals, match.awayGoals);
    record(tallies.get(match.awayClubId), match.awayGoals, match.homeGoals);
  }
  return [...tallies.values()].sort(standingOrder).map((tally, index) => ({ position: index + 1, ...tally }));
}

function emptyTally({ id, name }: LeagueClub): Tally {
  return {
    clubId: id,
    clubName: name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function record(tally: Tally | undefined, scored: number, conceded: number): void {
  if (tally === undefined) {
    return;
  }
  tally.played++;
  tally.goalsFor += scored;
  tally.goalsAgainst += conceded;
  tally.goalDifference = tally.goalsFor - tally.goalsAgainst;
  if (scored > conceded) {
    tally.wins++;
    tally.points += WIN_POINTS;
  } else if (scored === conceded) {
    tally.draws++;
    tally.points += DRAW_POINTS;
  } else {
    tally.losses++;
  }
}
