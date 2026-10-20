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

/** Soma exata de valores em moedas já arredondados. */
export function sumMoney(amounts: readonly number[]): number {
  return fromCents(amounts.reduce((total, amount) => total + toCents(amount), 0));
}

/**
 * Valor × percentual ÷ 100, com o percentual em até 2 casas, arredondado uma
 * única vez para 2 casas, com o meio para longe do zero.
 */
export function percentageOf(amount: number, percent: number): number {
  const basisPoints = Math.round(percent * BASIS_POINTS_PER_PERCENT);
  return fromCents(roundedDivision(toCents(amount) * basisPoints, BASIS_POINTS_PER_UNIT));
}
