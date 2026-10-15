import { MAX_ID, parsePositiveInteger } from './positive-integer';
import { isOneOf, isWithin, Range, rejectInvalid } from './rules';
import { codePointLength, hasControlCharacter, normalizeSpaces } from './text-normalization';

export type QueryParams = Record<string, unknown>;

/** Faixa dos ids recebidos em query params (`club_id`, `player_id`). */
export const ID_RANGE: Range = { min: 1, max: MAX_ID };

const DECIMAL_FORMAT = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

/*
 * Leitores dos query params ("1. Filtros e query params aceitos"). Parâmetro
 * ausente devolve `undefined` (não filtra); presente com valor vazio, repetido
 * ou fora do formato é recusado com 400. Parâmetros fora da tabela são ignorados,
 * porque só os pedidos são lidos.
 */

/** Inteiro positivo, só com dígitos, sem sinal, sem zeros à esquerda, ponto ou expoente. */
export function readQueryInteger(query: QueryParams, name: string, range: Range): number | undefined {
  const value = readQueryValue(query, name);
  if (value === undefined) {
    return undefined;
  }

  const integer = parsePositiveInteger(value);
  if (integer === null || !isWithin(integer, range)) {
    return rejectInvalid(`O parâmetro ${name} deve ser um inteiro de ${range.min} a ${range.max}.`);
  }
  return integer;
}

/** Decimal na forma `10`, `10.5` ou `10.55`: sem sinal, expoente, vírgula ou zeros à esquerda. */
export function readQueryDecimal(query: QueryParams, name: string, range: Range): number | undefined {
  const value = readQueryValue(query, name);
  if (value === undefined) {
    return undefined;
  }

  const decimal = DECIMAL_FORMAT.test(value) ? Number(value) : null;
  if (decimal === null || !isWithin(decimal, range)) {
    return rejectInvalid(`O parâmetro ${name} deve ser um decimal de ${range.min} a ${range.max}, com até 2 casas.`);
  }
  return decimal;
}

/** `true` ou `false`, exatamente assim. */
export function readQueryBoolean(query: QueryParams, name: string): boolean | undefined {
  const value = readQueryValue(query, name);
  if (value === undefined) {
    return undefined;
  }

  if (!isOneOf(value, ['true', 'false'] as const)) {
    return rejectInvalid(`O parâmetro ${name} deve ser true ou false.`);
  }
  return value === 'true';
}

/** Um valor de lista, exatamente como escrito (V5). */
export function readQueryEnum<T extends string>(query: QueryParams, name: string, values: readonly T[]): T | undefined {
  const value = readQueryValue(query, name);
  if (value === undefined) {
    return undefined;
  }

  if (!isOneOf(value, values)) {
    return rejectInvalid(invalidListMessage(name, values));
  }
  return value;
}

/** Um ou mais valores de lista, separados por vírgula, sem espaços e sem repetição. */
export function readQueryEnumList<T extends string>(
  query: QueryParams,
  name: string,
  values: readonly T[],
): T[] | undefined {
  const value = readQueryValue(query, name);
  if (value === undefined) {
    return undefined;
  }

  const items = value.split(',');
  const allValid = items.every((item) => isOneOf(item, values));
  if (!allValid || new Set(items).size !== items.length) {
    return rejectInvalid(invalidListMessage(name, values));
  }
  return items as T[];
}

/** V4 aplicada a um texto de busca: espaços normalizados, sem controles e com tamanho limitado. */
export function readQueryText(query: QueryParams, name: string, length: Range): string | undefined {
  const value = readQueryValue(query, name);
  if (value === undefined) {
    return undefined;
  }

  if (hasControlCharacter(value)) {
    return rejectInvalid(`O parâmetro ${name} não pode conter caracteres de controle.`);
  }

  const text = normalizeSpaces(value);
  if (!isWithin(codePointLength(text), length)) {
    return rejectInvalid(`O parâmetro ${name} deve ter de ${length.min} a ${length.max} caracteres.`);
  }
  return text;
}

function readQueryValue(query: QueryParams, name: string): string | undefined {
  if (!Object.hasOwn(query, name)) {
    return undefined;
  }

  const value = query[name];
  if (typeof value !== 'string' || value.length === 0) {
    return rejectInvalid(`O parâmetro ${name} não pode ser vazio nem repetido.`);
  }
  return value;
}

function invalidListMessage(name: string, values: readonly string[]): string {
  return `O parâmetro ${name} aceita somente: ${values.join(', ')}.`;
}
