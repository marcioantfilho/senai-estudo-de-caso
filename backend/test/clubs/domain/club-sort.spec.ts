import { describe, expect, it } from 'vitest';
import { ClubSummary } from '../../../src/modules/clubs/domain/club';
import { compareClubs } from '../../../src/modules/clubs/domain/club-sort';

const club = (id: number, name: string, netWorth: number): ClubSummary => ({
  id,
  name,
  acronym: 'AAB',
  cash: netWorth,
  squadValue: 0,
  netWorth,
});

const clubs = [
  club(1, 'Gama SC', 300),
  club(2, 'Épsilon EC', 310.5),
  club(3, 'Delta FC', 300),
  club(4, 'Águias FC', 298.15),
  club(5, 'Aguias FC', 300),
];
const ids = (option: Parameters<typeof compareClubs>[0]): number[] =>
  [...clubs].sort(compareClubs(option)).map(({ id }) => id);

describe('compareClubs (RN11)', () => {
  it('name: ordem alfabética das Premissas, empate pelo id', () => {
    expect(ids('name')).toEqual([4, 5, 3, 2, 1]);
  });

  it('net_worth_desc: empate pelo nome e depois pelo id', () => {
    expect(ids('net_worth_desc')).toEqual([2, 5, 3, 1, 4]);
  });

  it('net_worth_asc', () => {
    expect(ids('net_worth_asc')).toEqual([4, 5, 3, 1, 2]);
  });
});
