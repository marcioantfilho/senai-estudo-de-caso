import { describe, expect, it } from 'vitest';
import { calculateMarketValue } from '../../../src/modules/players/domain/market-value';
import { PhysicalCondition } from '../../../src/modules/players/domain/physical-condition';

describe('calculateMarketValue (RN02 a RN05)', () => {
  it.each<[number, PhysicalCondition, number, number, number]>([
    [82, 'APTO', 20, 25, 82],
    [82, 'APTO', 50, 19, 90.2],
    [82, 'MAL_CONDICIONADO', 50, 25, 69.7],
    [82, 'MAL_CONDICIONADO', 80, 21, 84.05],
    [82, 'MAL_CONDICIONADO', 30, 33, 53.3],
    [82, 'DOENTE', 90, 25, 69.7],
    [82, 'DOENTE', 30, 25, 49.2],
    [82, 'DOENTE', 10, 40, 49.2],
    [9.5, 'MAL_CONDICIONADO', 85, 25, 8.79],
    [1, 'MAL_CONDICIONADO', 50, 35, 1],
  ])('base %s, %s, agilidade %s, idade %s → %s', (baseValue, condition, agility, age, expected) => {
    expect(calculateMarketValue({ baseValue, condition, agility, age })).toBe(expected);
  });

  it.each([
    [79, 'sem efeito', 34],
    [80, 'metade do desconto', 37],
    [100, 'metade do desconto', 37],
    [31, 'sem efeito', 34],
    [30, 'mais 10 pontos', 30],
    [1, 'mais 10 pontos', 30],
  ])('agilidade %d em MAL_CONDICIONADO: %s', (agility, _effect, expected) => {
    expect(calculateMarketValue({ baseValue: 40, condition: 'MAL_CONDICIONADO', agility, age: 25 })).toBe(expected);
  });

  it.each([
    [21, 44],
    [22, 40],
    [31, 40],
    [32, 36],
  ])('idade %d em APTO → %d', (age, expected) => {
    expect(calculateMarketValue({ baseValue: 40, condition: 'APTO', agility: 50, age })).toBe(expected);
  });

  it('meio arredondado para longe do zero', () => {
    expect(calculateMarketValue({ baseValue: 1.7, condition: 'MAL_CONDICIONADO', agility: 50, age: 25 })).toBe(1.45);
  });
});
