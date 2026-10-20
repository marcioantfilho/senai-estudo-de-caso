import { parseBrasiliaDateTime } from '../brasilia-date-time';
import { JsonObject } from '../pipes/json-object-body.pipe';
import { isOneOf, isWithin, Range, rejectInvalid } from './rules';
import { codePointLength, hasControlCharacter, normalizeSpaces } from './text-normalization';

/*
 * Leitores dos campos do corpo, usados pelos pipes de cada endpoint. Cada um lê
 * só o campo pedido, então campos extras ou com outro nome (como `loyaltyUntil`)
 * são ignorados (V7). Nenhum valor é convertido: tipo errado é recusado (V2).
 */

/** V4: texto com espaços normalizados, sem caracteres de controle e com tamanho em pontos de código. */
export function readText(body: JsonObject, field: string, length: Range): string {
  const value = readRequired(body, field);
  if (typeof value !== 'string') {
    return rejectInvalid(`O campo ${field} deve ser um texto.`);
  }
  if (hasControlCharacter(value)) {
    return rejectInvalid(`O campo ${field} não pode conter caracteres de controle.`);
  }

  const text = normalizeSpaces(value);
  if (text.length === 0) {
    return rejectInvalid(requiredMessage(field));
  }
  if (!isWithin(codePointLength(text), length)) {
    return rejectInvalid(`O campo ${field} deve ter de ${length.min} a ${length.max} caracteres.`);
  }
  return text;
}

/** Texto lido como enviado, sem a normalização da V4, que vale só para nomes. */
export function readString(body: JsonObject, field: string): string {
  const value = readRequired(body, field);
  if (typeof value !== 'string') {
    return rejectInvalid(`O campo ${field} deve ser um texto.`);
  }
  return value;
}

/** V2: número JSON inteiro (`50.0` vale 50; `50.5` e `"50"` são recusados). */
export function readInteger(body: JsonObject, field: string, range: Range): number {
  const value = readRequired(body, field);
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return rejectInvalid(`O campo ${field} deve ser um número inteiro.`);
  }
  if (!isWithin(value, range)) {
    return rejectInvalid(`O campo ${field} deve estar entre ${range.min} e ${range.max}.`);
  }
  return value;
}

/** V5: valor de lista exatamente como escrito. */
export function readEnum<T extends string>(body: JsonObject, field: string, values: readonly T[]): T {
  const value = readRequired(body, field);
  if (!isOneOf(value, values)) {
    return rejectInvalid(`O campo ${field} deve ser um destes valores: ${values.join(', ')}.`);
  }
  return value;
}

/** RN01: data e hora no formato `AAAA-MM-DDTHH:MM-03:00`, existente no calendário. */
export function readDateTime(body: JsonObject, field: string): Date {
  const value = readRequired(body, field);
  const date = typeof value === 'string' ? parseBrasiliaDateTime(value) : null;
  if (date === null) {
    return rejectInvalid(`O campo ${field} deve ser uma data e hora válida no formato AAAA-MM-DDTHH:MM-03:00.`);
  }
  return date;
}

/** V6: campo ausente ou `null` é recusado. */
function readRequired(body: JsonObject, field: string): unknown {
  const value = Object.hasOwn(body, field) ? body[field] : undefined;
  if (value === undefined || value === null) {
    return rejectInvalid(requiredMessage(field));
  }
  return value;
}

function requiredMessage(field: string): string {
  return `O campo ${field} é obrigatório.`;
}
