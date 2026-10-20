import { foldText } from '../../../shared/domain/text-comparison';

export const CLUB_NAME_LENGTH = { min: 3, max: 60 };
export const CLUB_NAME_WORDS = { min: 2, max: 5 };

const CLUB_NAME_CHARACTERS = /^[\p{L} .-]+$/u;
const ACRONYM_FORMAT = /^[A-Z]{3}$/;
const LETTER = /\p{L}/u;

/** Só letras (com ou sem acento), espaços, hífen e ponto. */
export function hasValidClubNameCharacters(name: string): boolean {
  return CLUB_NAME_CHARACTERS.test(name);
}

/** Exatamente 3 letras de A a Z, maiúsculas e sem acento, que não sejam todas iguais. */
export function hasValidAcronymFormat(acronym: string): boolean {
  return ACRONYM_FORMAT.test(acronym) && new Set(acronym).size > 1;
}

/**
 * As letras da sigla aparecem no nome nessa ordem, sem diferenciar maiúsculas,
 * minúsculas e acentos, e a primeira delas é a primeira letra do nome.
 */
export function isAcronymOfName(acronym: string, name: string): boolean {
  const [first, ...rest] = Array.from(foldText(name)).filter((character) => LETTER.test(character));
  const [firstWanted, ...restWanted] = Array.from(acronym.toLowerCase());
  if (first !== firstWanted) {
    return false;
  }

  let matched = 0;
  for (const letter of rest) {
    if (letter === restWanted[matched]) {
      matched++;
    }
  }
  return matched >= restWanted.length;
}
