import { describe, expect, it } from 'vitest';
import { calculateOverall, PlayerAttributes } from '../../../src/modules/players/domain/overall';
import { Position } from '../../../src/modules/players/domain/position';

function attributes(
  pace: number,
  shooting: number,
  passing: number,
  dribbling: number,
  defending: number,
  physical: number,
): PlayerAttributes {
  return { pace, shooting, passing, dribbling, defending, physical };
}

describe('calculateOverall (RN06)', () => {
  it.each<[Position, PlayerAttributes, number]>([
    ['MEI', attributes(68, 65, 80, 78, 52, 60), 73],
    ['ATA', attributes(78, 75, 73, 82, 48, 68), 76],
    ['LAT', attributes(72, 70, 78, 76, 70, 66), 72],
    ['ZAG', attributes(50, 90, 60, 40, 80, 75), 73],
    ['GOL', attributes(55, 30, 65, 40, 72, 68), 68],
  ])('%s %o → %d', (position, playerAttributes, expected) => {
    expect(calculateOverall(position, playerAttributes)).toBe(expected);
  });

  it('72,45 arredonda para baixo', () => {
    expect(calculateOverall('LAT', attributes(73, 70, 77, 76, 70, 66))).toBe(72);
  });
});
