const CONTROL_CHARACTER = /\p{Cc}/u;
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

/** Tamanho em pontos de código Unicode, e não em unidades UTF-16. */
export function codePointLength(text: string): number {
  return [...text].length;
}
