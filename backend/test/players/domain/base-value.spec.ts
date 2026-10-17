import { describe, expect, it } from 'vitest';
import { calculateBaseValue } from '../../../src/modules/players/domain/base-value';

describe('calculateBaseValue (RN06)', () => {
  it.each([
    [75, 86, 25, 40],
    [60, 70, 30, 10],
    [61, 70, 30, 12],
    [76, 80, 22, 46],
    [85, 92, 27, 100],
    [70, 84, 21, 34.2],
    [70, 84, 22, 30],
    [45, 90, 18, 3.63],
    [40, 66, 36, 1],
    [99, 99, 30, 184],
  ])('overall %d, potencial %d, idade %d → %s', (overall, potential, ageAtRegistration, expected) => {
    expect(calculateBaseValue({ overall, potential, ageAtRegistration })).toBe(expected);
  });

  it('jovem promessa com parte do overall zerada fica no piso', () => {
    expect(calculateBaseValue({ overall: 40, potential: 99, ageAtRegistration: 18 })).toBe(1);
  });
});
