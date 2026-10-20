import { describe, expect, it } from 'vitest';
import { createClub, summarizeClub } from '../../../src/modules/clubs/domain/club';
import { PlayerDetails } from '../../../src/modules/players/domain/player';

describe('createClub (RN10)', () => {
  it('nasce com 300,00 em caixa', () => {
    expect(createClub({ name: 'Águias FC', acronym: 'AGU' })).toEqual({ name: 'Águias FC', acronym: 'AGU', cash: 300 });
  });
});

describe('summarizeClub (RN11)', () => {
  const club = { id: 1, name: 'Águias FC', acronym: 'AGU', cash: 261.15 };

  it('sem jogadores, valor do elenco 0,00 e patrimônio igual ao caixa', () => {
    expect(summarizeClub({ ...club, cash: 300 }, [])).toMatchObject({ squadValue: 0, netWorth: 300 });
  });

  it('soma exata dos valores de mercado', () => {
    const squad = [{ marketValue: 37 }, { marketValue: 0.1 }, { marketValue: 0.2 }] as PlayerDetails[];
    expect(summarizeClub(club, squad)).toMatchObject({ squadValue: 37.3, netWorth: 298.45 });
  });
});
