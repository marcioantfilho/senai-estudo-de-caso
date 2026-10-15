import { InvalidRequestException } from '../api.exception';

/** Faixa inclusiva: o mínimo e o máximo são aceitos. */
export interface Range {
  min: number;
  max: number;
}

export function isWithin(value: number, range: Range): boolean {
  return value >= range.min && value <= range.max;
}

/** V5: compara o valor exatamente como escrito, sem converter maiúsculas e minúsculas. */
export function isOneOf<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === 'string' && (values as readonly string[]).includes(value);
}

/** Recusa com 400 (V9). */
export function rejectInvalid(message: string): never {
  throw new InvalidRequestException(message);
}
