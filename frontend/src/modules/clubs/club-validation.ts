import { validateTextLength } from '../../shared/validation/text'

const CLUB_NAME_LENGTH = { min: 3, max: 60 }
const ACRONYM_FORMAT = /^\p{L}{3}$/u

/** Obrigatório e de 3 a 60 caracteres; palavras, caracteres aceitos e nome repetido ficam com a API. */
export function validateClubName(name: string): string | undefined {
  return validateTextLength(name, CLUB_NAME_LENGTH, 'Informe o nome.')
}

/** Obrigatória e com 3 letras; maiúsculas, acentos e letras do nome ficam com a API. */
export function validateAcronym(acronym: string): string | undefined {
  if (acronym === '') {
    return 'Informe a sigla.'
  }
  return ACRONYM_FORMAT.test(acronym) ? undefined : 'Use 3 letras.'
}
