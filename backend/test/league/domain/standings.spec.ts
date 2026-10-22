import { describe, expect, it } from 'vitest';
import { computeStandings, MatchScore } from '../../../src/modules/league/domain/standings';

const score = (homeClubId: number, homeGoals: number, awayGoals: number, awayClubId: number): MatchScore => ({
  homeClubId,
  awayClubId,
  homeGoals,
  awayGoals,
});

describe('computeStandings (RN21)', () => {
  it('exemplo da RN21: 6 clubes e 4 partidas', () => {
    const clubs = [
      { id: 1, name: 'Águias FC' },
      { id: 2, name: 'Delta FC' },
      { id: 3, name: 'Gama SC' },
      { id: 4, name: 'Épsilon EC' },
      { id: 5, name: 'Tubarões EC' },
      { id: 6, name: 'Mangue FC' },
    ];
    const matches = [score(1, 1, 2, 2), score(3, 2, 1, 4), score(4, 3, 2, 1), score(2, 0, 1, 3)];
    const rows = computeStandings(clubs, matches);
    expect(rows.map((r) => [r.position, r.clubName, r.points, r.goalDifference, r.goalsFor])).toEqual([
      [1, 'Gama SC', 6, 2, 3],
      [2, 'Épsilon EC', 3, 0, 4],
      [3, 'Delta FC', 3, 0, 2],
      [4, 'Mangue FC', 0, 0, 0],
      [5, 'Tubarões EC', 0, 0, 0],
      [6, 'Águias FC', 0, -2, 3],
    ]);
  });

  it('exemplo 2.4.3: todos os campos, inclusive do clube que ainda não jogou', () => {
    const clubs = [
      { id: 1, name: 'Águias FC' },
      { id: 2, name: 'Delta FC' },
      { id: 3, name: 'Gama SC' },
    ];
    expect(computeStandings(clubs, [score(1, 1, 2, 2)])).toEqual([
      { position: 1, clubId: 2, clubName: 'Delta FC', played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 2, goalsAgainst: 1, goalDifference: 1, points: 3 },
      { position: 2, clubId: 3, clubName: 'Gama SC', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
      { position: 3, clubId: 1, clubName: 'Águias FC', played: 1, wins: 0, draws: 0, losses: 1, goalsFor: 1, goalsAgainst: 2, goalDifference: -1, points: 0 },
    ]);
  });

  it('empate soma 1 ponto para cada clube', () => {
    const rows = computeStandings([{ id: 1, name: 'Alfa FC' }, { id: 2, name: 'Beta FC' }], [score(1, 2, 2, 2)]);
    expect(rows.map((r) => [r.clubName, r.points, r.draws, r.played])).toEqual([
      ['Alfa FC', 1, 1, 1],
      ['Beta FC', 1, 1, 1],
    ]);
  });

  it('confrontos repetidos contam como partidas distintas', () => {
    const rows = computeStandings([{ id: 1, name: 'Alfa FC' }, { id: 2, name: 'Beta FC' }], [score(1, 1, 0, 2), score(1, 1, 0, 2), score(2, 0, 0, 1)]);
    expect(rows[0]).toMatchObject({ clubName: 'Alfa FC', played: 3, wins: 2, draws: 1, points: 7, goalsFor: 2 });
    expect(rows[1]).toMatchObject({ clubName: 'Beta FC', played: 3, losses: 2, draws: 1, points: 1 });
  });

  it('nomes iguais pelas Premissas (Águias FC e Aguias FC) desempatam pelo id; posição 1..N sem repetir', () => {
    const rows = computeStandings([{ id: 7, name: 'Águias FC' }, { id: 3, name: 'Aguias FC' }, { id: 5, name: 'Delta FC' }], []);
    expect(rows.map((r) => [r.position, r.clubId])).toEqual([
      [1, 3],
      [2, 7],
      [3, 5],
    ]);
  });

  it('sem clubes, lista vazia', () => {
    expect(computeStandings([], [])).toEqual([]);
  });
});
