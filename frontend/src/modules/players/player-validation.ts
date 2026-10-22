const NAME_LENGTH = { min: 3, max: 100 }
export const AGE_RANGE = { min: 16, max: 45 }
export const AGILITY_RANGE = { min: 1, max: 100 }
export const ATTRIBUTE_RANGE = { min: 1, max: 99 }
export const MARKET_VALUE_RANGE = { min: 0, max: 550 }
export const SEARCH_MIN_LENGTH = 2

const INTEGER_FORMAT = /^\d+$/
const DECIMAL_FORMAT = /^\d+([.,]\d{1,2})?$/
const REPEATED_SPACES = / +/g

type Range = { min: number; max: number }

/** V4: espaços do início e do fim removidos e repetidos juntados, como a API grava. */
export function normalizeName(name: string): string {
  return name.trim().replace(REPEATED_SPACES, ' ')
}

export function validateName(name: string): string | undefined {
  const normalized = normalizeName(name)
  if (normalized.length === 0) {
    return 'Informe o nome.'
  }
  const length = [...normalized].length
  if (length < NAME_LENGTH.min || length > NAME_LENGTH.max) {
    return `Use de ${NAME_LENGTH.min} a ${NAME_LENGTH.max} caracteres.`
  }
  return undefined
}

export function validateInteger(raw: string, range: Range, missingMessage: string): string | undefined {
  const value = raw.trim()
  if (value === '') {
    return missingMessage
  }
  if (!INTEGER_FORMAT.test(value) || !isWithin(Number(value), range)) {
    return `Use um valor de ${range.min} a ${range.max}.`
  }
  return undefined
}

/** Faixa de valor de mercado do filtro: até 2 casas, com vírgula ou ponto; vazio não filtra. */
export function validateMoneyFilter(raw: string): string | undefined {
  const value = raw.trim()
  if (value === '') {
    return undefined
  }
  if (!DECIMAL_FORMAT.test(value) || !isWithin(Number(value.replace(',', '.')), MARKET_VALUE_RANGE)) {
    return `Use um valor de ${MARKET_VALUE_RANGE.min} a ${MARKET_VALUE_RANGE.max}, com até 2 casas.`
  }
  return undefined
}

/** Formato aceito pela API nos query params de valor (`10`, `10.5` ou `10.55`). */
export function toApiDecimal(raw: string): string | undefined {
  const value = raw.trim()
  return value === '' ? undefined : String(Number(value.replace(',', '.')))
}

export function validateAgeFilter(raw: string): string | undefined {
  return raw.trim() === '' ? undefined : validateInteger(raw, AGE_RANGE, '')
}

function isWithin(value: number, { min, max }: Range): boolean {
  return value >= min && value <= max
}
