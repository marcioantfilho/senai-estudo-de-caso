const COMBINING_MARK = /\p{Mn}/gu;

/** Minúsculas e sem acentos: forma NFD sem as marcas da categoria Unicode Mn (inclui a cedilha). */
export function foldText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(COMBINING_MARK, '');
}

/** RN07: procura o trecho dentro do texto, sem diferenciar maiúsculas, minúsculas e acentos. */
export function containsIgnoringCaseAndAccents(text: string, fragment: string): boolean {
  return foldText(text).includes(foldText(fragment));
}

/** Ordem alfabética das Premissas: texto dobrado, comparado ponto de código a ponto de código. */
export function compareAlphabetically(left: string, right: string): number {
  return compareCodePoints(foldText(left), foldText(right));
}

function compareCodePoints(left: string, right: string): number {
  const leftPoints = Array.from(left, (character) => character.codePointAt(0) ?? 0);
  const rightPoints = Array.from(right, (character) => character.codePointAt(0) ?? 0);
  const sharedLength = Math.min(leftPoints.length, rightPoints.length);

  for (let index = 0; index < sharedLength; index++) {
    const difference = (leftPoints[index] ?? 0) - (rightPoints[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return leftPoints.length - rightPoints.length;
}
