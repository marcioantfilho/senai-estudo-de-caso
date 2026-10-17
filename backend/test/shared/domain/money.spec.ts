import { describe, expect, it } from 'vitest';
import { percentageOf } from '../../../src/shared/domain/money';
import { roundedDivision } from '../../../src/shared/domain/rounding';

describe('roundedDivision', () => {
  it.each([
    [145, 10, 15],
    [144, 10, 14],
    [-145, 10, -15],
    [-144, 10, -14],
    [7250, 100, 73],
    [7249, 100, 72],
  ])('%d ÷ %d → %d', (numerator, denominator, expected) => {
    expect(roundedDivision(numerator, denominator)).toBe(expected);
  });
});

describe('percentageOf', () => {
  it.each([
    [29.55, 50, 14.78],
    [3.85, 10, 0.39],
    [30.01, 5, 1.5],
    [-7.69, 50, -3.85],
    [82, 102.5, 84.05],
  ])('%s × %s%% → %s', (amount, percent, expected) => {
    expect(percentageOf(amount, percent)).toBe(expected);
  });
});
