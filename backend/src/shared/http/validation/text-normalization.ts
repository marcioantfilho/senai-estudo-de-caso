const CONTROL_CHARACTER = /\p{Cc}/u;
const LETTER = /\p{L}/u;
const DIGIT = /[0-9]/;
const OUTER_SPACES = /^ +| +$/g;
const REPEATED_SPACES = / {2,}/g;

/** V4: caracteres de controle (como tabulação e quebra de linha) são recusados. */
export function hasControlCharacter(text: string): boolean {
  return CONTROL_CHARACTER.test(text);
}

/** V4: remove os espaços (U+0020) do início e do fim e junta os repetidos. */
export function normalizeSpaces(text: string): string {
  return text.replace(OUTER_SPACES, '').replace(REPEATED_SPACES, ' ');
}

/** V4: palavra é uma sequência sem espaços com pelo menos uma letra (categoria Unicode L). */
export function countWords(text: string): number {
  return text.split(' ').filter((token) => LETTER.test(token)).length;
}

/** V4: dígito vai de 0 a 9. */
export function hasDigit(text: string): boolean {
  return DIGIT.test(text);
}

/** Tamanho em pontos de código Unicode, e não em unidades UTF-16. */
export function codePointLength(text: string): number {
  return [...text].length;
}
