import { describe, expect, it } from 'vitest';
import { matchValue, playMatch, TeamSheet } from '../../../src/modules/league/domain/match';
import { PlayerAttributes } from '../../../src/modules/players/domain/overall';
import { PhysicalCondition } from '../../../src/modules/players/domain/physical-condition';
import { Player } from '../../../src/modules/players/domain/player';
import { Position } from '../../../src/modules/players/domain/position';

const neutral: PlayerAttributes = { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 };

function player(
  id: number,
  name: string,
  position: Position,
  attributes: Partial<PlayerAttributes>,
  condition: PhysicalCondition = 'APTO',
): Player {
  return {
    id,
    name,
    position,
    agility: 50,
    age: 25,
    baseValue: 10,
    condition,
    clubId: 1,
    attributes: { ...neutral, ...attributes },
    potential: 99,
  };
}

/** Exemplo completo da RN20: Águias FC (mandante) × Delta FC (visitante), os dois no 2-1-1. */
const aguias: TeamSheet = {
  clubId: 1,
  clubName: 'Águias FC',
  formation: '2-1-1',
  starters: [
    player(34, 'Otto Rangel', 'ATA', { shooting: 75 }),
    player(31, 'Davi Lins', 'LAT', { dribbling: 74, defending: 66 }, 'MAL_CONDICIONADO'),
    player(30, 'Rui Prado', 'GOL', { defending: 77 }),
    player(33, 'Lauro Neves', 'MEI', { passing: 82 }),
    player(32, 'Téo Brandão', 'ZAG', { defending: 84 }),
  ],
};
const delta: TeamSheet = {
  clubId: 2,
  clubName: 'Delta FC',
  formation: '2-1-1',
  starters: [
    player(40, 'Ivo Teles', 'GOL', { defending: 72 }),
    player(41, 'Hugo Vaz', 'ZAG', { defending: 84 }),
    player(42, 'Lino Matos', 'LAT', { dribbling: 79, defending: 63 }),
    player(43, 'Nei Soares', 'MEI', { passing: 70 }),
    player(44, 'Ugo Falcão', 'ATA', { shooting: 81 }),
  ],
};

describe('matchValue (RN20)', () => {
  it.each([
    [74, 'MAL_CONDICIONADO', 63],
    [50, 'MAL_CONDICIONADO', 43],
    [66, 'MAL_CONDICIONADO', 56],
    [1, 'MAL_CONDICIONADO', 1],
    [99, 'MAL_CONDICIONADO', 84],
    [74, 'APTO', 74],
  ] as const)('%s em %s → %s', (attribute, condition, expected) => {
    expect(matchValue(attribute, condition)).toBe(expected);
  });
});

describe('playMatch (RN20)', () => {
  const match = playMatch(aguias, delta);

  it('placar do exemplo: Águias FC 1 × 2 Delta FC, VISITANTE', () => {
    expect(match.home).toEqual({ clubId: 1, clubName: 'Águias FC', formation: '2-1-1', goals: 1 });
    expect(match.away).toEqual({ clubId: 2, clubName: 'Delta FC', formation: '2-1-1', goals: 2 });
    expect(match.result).toBe('VISITANTE');
  });

  it('os 6 duelos da tabela do exemplo, na ordem', () => {
    const summary = match.duels.map((d) => [
      d.order,
      d.attackingClubId,
      d.attacker.playerId,
      d.attacker.attribute,
      d.attacker.value,
      d.defender.playerId,
      d.defender.value,
      d.goal,
    ]);
    expect(summary).toEqual([
      [1, 1, 34, 'shooting', 75, 40, 72, true],
      [2, 1, 33, 'passing', 82, 41, 84, false],
      [3, 1, 31, 'dribbling', 63, 42, 63, false],
      [4, 2, 44, 'shooting', 81, 30, 77, true],
      [5, 2, 43, 'passing', 70, 32, 84, false],
      [6, 2, 42, 'dribbling', 79, 31, 56, true],
    ]);
  });

  it('duelo empatado (63 × 63) não é gol', () => {
    const tied = match.duels[2];
    expect(tied?.attacker.value).toBe(tied?.defender.value);
    expect(tied?.goal).toBe(false);
  });

  it('snapshot de cada lado: nome, posição, condição, atributo e valor; defesa sempre defending', () => {
    expect(match.duels[2]?.attacker).toEqual({
      playerId: 31,
      playerName: 'Davi Lins',
      position: 'LAT',
      condition: 'MAL_CONDICIONADO',
      attribute: 'dribbling',
      value: 63,
    });
    expect(match.duels.every((d) => d.defender.attribute === 'defending')).toBe(true);
    expect(match.duels[3]?.defender).toMatchObject({ position: 'GOL', attribute: 'defending', value: 77 });
  });

  it('não altera os jogadores', () => {
    expect(aguias.starters.find((p) => p.id === 31)?.attributes).toEqual({ ...neutral, dribbling: 74, defending: 66 });
  });

  it('sem sorteio: mesma entrada, mesmo resultado', () => {
    expect(playMatch(aguias, delta)).toEqual(match);
  });

  it('EMPATE e MANDANTE', () => {
    expect(playMatch(aguias, aguias).result).toBe('EMPATE');
    expect(playMatch(delta, aguias).result).toBe('MANDANTE');
  });
});

describe('quem ataca e quem defende nas outras formações (RN20)', () => {
  const team = (clubId: number, formation: TeamSheet['formation'], positions: Position[]): TeamSheet => ({
    clubId,
    clubName: `Clube ${clubId}`,
    formation,
    starters: positions.map((position, index) => player(clubId * 10 + index, `Jogador ${'ABCDE'[index]}`, position, {})),
  });

  it.each<[TeamSheet['formation'], Position[], string[]]>([
    ['3-1', ['GOL', 'ZAG', 'LAT', 'LAT', 'ATA'], ['ATA:shooting', 'LAT:dribbling', 'LAT:dribbling']],
    ['2-2', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA'], ['ATA:shooting', 'ATA:shooting', 'LAT:dribbling']],
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'], ['ATA:shooting', 'MEI:passing', 'LAT:dribbling']],
    ['1-2-1', ['GOL', 'ZAG', 'MEI', 'MEI', 'ATA'], ['ATA:shooting', 'MEI:passing', 'MEI:passing']],
  ])('%s: atacam 4º, 3º e 2º; defendem GOL, 1º e 2º', (formation, positions, attackers) => {
    const home = team(1, formation, positions);
    const { duels } = playMatch(home, team(2, formation, positions));
    expect(duels.slice(0, 3).map((d) => `${d.attacker.position}:${d.attacker.attribute}`)).toEqual(attackers);
    expect(duels.slice(3).map((d) => d.defender.position)).toEqual([positions[0], positions[1], positions[2]]);
  });

  it('1-2-1: os dois MEI seguem o nome; o que vem antes é o 2º e ataca no duelo 3', () => {
    const home: TeamSheet = {
      clubId: 1,
      clubName: 'Clube A',
      formation: '1-2-1',
      starters: [
        player(5, 'Zeca Meio', 'MEI', {}),
        player(1, 'Gol Um', 'GOL', {}),
        player(2, 'Zag Um', 'ZAG', {}),
        player(4, 'Ana Meio', 'MEI', {}),
        player(3, 'Ata Um', 'ATA', {}),
      ],
    };
    const { duels } = playMatch(home, home);
    expect(duels[2]?.attacker.playerName).toBe('Ana Meio');
    expect(duels[1]?.attacker.playerName).toBe('Zeca Meio');
  });
});
