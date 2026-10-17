import { PlayerAttributes } from './overall';

export const PLAYER_NAME_LENGTH = { min: 3, max: 100 };
export const PLAYER_NAME_MIN_WORDS = 2;
export const AGE_RANGE = { min: 16, max: 45 };
export const AGILITY_RANGE = { min: 1, max: 100 };
export const ATTRIBUTE_RANGE = { min: 1, max: 99 };
export const POTENTIAL_RANGE = { min: 1, max: 99 };

const SENIOR_AGILITY_MIN_AGE = 35;
const SENIOR_MAX_AGILITY = 85;
const MAX_ATTRIBUTE_SUM = 480;
const POTENTIAL_EQUALS_BEST_MIN_AGE = 33;

/** Com 35 anos ou mais, a agilidade é no máximo 85. */
export function isAgilityAllowedForAge(agility: number, age: number): boolean {
  return age < SENIOR_AGILITY_MIN_AGE || agility <= SENIOR_MAX_AGILITY;
}

/** A soma dos seis atributos não passa de 480. */
export function isAttributeSumAllowed(attributes: PlayerAttributes): boolean {
  return sumOf(Object.values(attributes)) <= MAX_ATTRIBUTE_SUM;
}

/**
 * RN06: o potencial nunca é menor que o maior atributo; no cadastro com 33 anos
 * ou mais, é igual a ele.
 */
export function isPotentialAllowed(potential: number, attributes: PlayerAttributes, ageAtRegistration: number): boolean {
  const bestAttribute = Math.max(...Object.values(attributes));
  return ageAtRegistration >= POTENTIAL_EQUALS_BEST_MIN_AGE ? potential === bestAttribute : potential >= bestAttribute;
}

function sumOf(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
