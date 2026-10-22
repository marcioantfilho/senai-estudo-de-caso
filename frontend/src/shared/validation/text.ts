const REPEATED_SPACES = / +/g

export type LengthRange = { min: number; max: number }

/** V4: espaços do início e do fim removidos e repetidos juntados, como a API grava. */
export function normalizeName(name: string): string {
  return name.trim().replace(REPEATED_SPACES, ' ')
}

/** Campo de texto obrigatório com tamanho em caracteres (pontos de código), contado depois da V4. */
export function validateTextLength(text: string, range: LengthRange, missingMessage: string): string | undefined {
  const normalized = normalizeName(text)
  if (normalized.length === 0) {
    return missingMessage
  }
  const length = [...normalized].length
  if (length < range.min || length > range.max) {
    return `Use de ${range.min} a ${range.max} caracteres.`
  }
  return undefined
}
