import { describe, expect, it } from 'vitest';
import { describeLineup } from '../../../src/modules/league/application/lineup-details';
import { Player } from '../../../src/modules/players/domain/player';
import { Position } from '../../../src/modules/players/domain/position';

const attributes = { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 };
const player = (id: number, name: string, position: Position): Player => ({
  id,
  name,
  position,
  agility: 50,
  age: 25,
  baseValue: 10,
  condition: 'APTO',
  clubId: 1,
  attributes,
  potential: 50,
});

describe('describeLineup (RN19)', () => {
  const starters = [
    player(34, 'Otto Rangel', 'ATA'),
    player(31, 'Davi Lins', 'LAT'),
    player(30, 'Rui Prado', 'GOL'),
    player(33, 'Lauro Neves', 'MEI'),
    player(32, 'Téo Brandão', 'ZAG'),
  ];

  it('exemplo 2.4.1: completa e na ordem do elenco', () => {
    const lineup = describeLineup({ clubId: 1, formation: '2-1-1', starters });
    expect(lineup.complete).toBe(true);
    expect(lineup.players.map(({ id }) => id)).toEqual([30, 32, 31, 33, 34]);
  });

  it('sem escalação: formação nula, incompleta e lista vazia', () => {
    expect(describeLineup({ clubId: 1, formation: null, starters: [] })).toEqual({
      clubId: 1,
      formation: null,
      complete: false,
      players: [],
    });
  });

  it('incompleta: mantém a formação salva e traz os titulares que sobraram', () => {
    const lineup = describeLineup({ clubId: 1, formation: '2-1-1', starters: starters.slice(1) });
    expect(lineup).toMatchObject({ formation: '2-1-1', complete: false });
    expect(lineup.players).toHaveLength(4);
  });
});
