/** Maior id aceito (inteiro de 32 bits do PostgreSQL). */
export const MAX_ID = 2_147_483_647;

const POSITIVE_INTEGER_FORMAT = /^[1-9]\d*$/;

/**
 * Inteiro positivo escrito só com dígitos, sem sinal, sem zeros à esquerda,
 * sem ponto e sem expoente. Devolve `null` para qualquer outra forma.
 */
export function parsePositiveInteger(text: string): number | null {
  return POSITIVE_INTEGER_FORMAT.test(text) ? Number(text) : null;
}
