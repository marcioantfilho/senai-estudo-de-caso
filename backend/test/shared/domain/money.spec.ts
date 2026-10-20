import { describe, expect, it } from 'vitest';
import {
  formatMoney,
  isAtMostHalfOf,
  percentageOf,
  subtractMoney,
  sumOfPercentages,
} from '../../../src/shared/domain/money';
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

describe('sumOfPercentages', () => {
  it('arredonda uma única vez: 0,005 + 0,005 → 0,01 (e não 0,02)', () => {
    expect(sumOfPercentages([{ amount: 0.05, percent: 10 }, { amount: 0.05, percent: 10 }])).toBe(0.01);
  });

  it('comissão de 10,01: 1,00 + 0,002 → 1,00', () => {
    expect(sumOfPercentages([{ amount: 10, percent: 10 }, { amount: 0.01, percent: 20 }])).toBe(1);
  });
});

describe('subtractMoney', () => {
  it.each([
    [40, [4, 0.3], 35.7],
    [42.5, [50], -7.5],
    [0.3, [0.1, 0.2], 0],
  ])('%s − %j → %s', (minuend, subtrahends, expected) => {
    expect(subtractMoney(minuend, ...subtrahends)).toBe(expected);
  });
});

describe('isAtMostHalfOf', () => {
  it.each([
    [130.57, 261.15, true],
    [130.58, 261.15, false],
    [50, 100, true],
    [50.01, 100, false],
    [0, 0, true],
  ])('%s ≤ metade de %s → %s', (amount, total, expected) => {
    expect(isAtMostHalfOf(amount, total)).toBe(expected);
  });
});

describe('formatMoney', () => {
  it.each([
    [40, '40,00'],
    [0.3, '0,30'],
    [-38.85, '-38,85'],
    [130.58, '130,58'],
    [0, '0,00'],
  ])('%s → %s', (amount, expected) => {
    expect(formatMoney(amount)).toBe(expected);
  });
});
