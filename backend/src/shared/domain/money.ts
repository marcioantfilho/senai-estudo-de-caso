import { roundedDivision } from './rounding';

const CENTS_PER_UNIT = 100;
const BASIS_POINTS_PER_PERCENT = 100;
const BASIS_POINTS_PER_UNIT = 100 * BASIS_POINTS_PER_PERCENT;

/** Valor em moedas com no máximo 2 casas, como gravado no banco e devolvido pela API. */
export function toCents(amount: number): number {
  return Math.round(amount * CENTS_PER_UNIT);
}

export function fromCents(cents: number): number {
  return cents / CENTS_PER_UNIT;
}

export interface PercentageShare {
  amount: number;
  percent: number;
}

/** Soma exata de valores em moedas já arredondados. */
export function sumMoney(amounts: readonly number[]): number {
  return fromCents(amounts.reduce((total, amount) => total + toCents(amount), 0));
}

/** Diferença exata entre valores em moedas já arredondados, com sinal. */
export function subtractMoney(minuend: number, ...subtrahends: number[]): number {
  return fromCents(subtrahends.reduce((total, amount) => total - toCents(amount), toCents(minuend)));
}

/** `amount` não passa da metade exata de `total`, sem arredondar a metade. */
export function isAtMostHalfOf(amount: number, total: number): boolean {
  return toCents(amount) * 2 <= toCents(total);
}

/**
 * Soma de valor × percentual ÷ 100 de cada parte, com percentuais em até 2
 * casas, arredondada uma única vez para 2 casas, com o meio para longe do zero.
 */
export function sumOfPercentages(shares: readonly PercentageShare[]): number {
  const numerator = shares.reduce(
    (total, { amount, percent }) => total + toCents(amount) * Math.round(percent * BASIS_POINTS_PER_PERCENT),
    0,
  );
  return fromCents(roundedDivision(numerator, BASIS_POINTS_PER_UNIT));
}

export function percentageOf(amount: number, percent: number): number {
  return sumOfPercentages([{ amount, percent }]);
}
