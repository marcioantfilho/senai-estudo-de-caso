import { describe, expect, it } from 'vitest';
import {
  hasValidAcronymFormat,
  hasValidClubNameCharacters,
  isAcronymOfName,
} from '../../../src/modules/clubs/domain/club-limits';

describe('hasValidClubNameCharacters', () => {
  it.each([
    ['Águias FC', true],
    ['São-Paulo F.C.', true],
    ['Clube 10', false],
    ['Clube & Cia', false],
    ["Clube D'Ouro", false],
  ])('%s → %s', (name, expected) => {
    expect(hasValidClubNameCharacters(name)).toBe(expected);
  });
});

describe('hasValidAcronymFormat', () => {
  it.each([
    ['AGU', true],
    ['AAB', true],
    ['AAA', false],
    ['agu', false],
    ['ÁGU', false],
    ['AG', false],
    ['AGUI', false],
    [' AGU', false],
  ])('%s → %s', (acronym, expected) => {
    expect(hasValidAcronymFormat(acronym)).toBe(expected);
  });
});

describe('isAcronymOfName', () => {
  it.each([
    ['AGU', 'Águias FC', true],
    ['AFC', 'Águias FC', true],
    ['DEL', 'Delta FC', true],
    ['GSC', 'Gama SC', true],
    ['ECC', 'Épsilon Ceará Clube', true],
    ['SCC', 'São Conceição Clube', true],
    ['GAU', 'Águias FC', false],
    ['FCA', 'Águias FC', false],
    ['AGG', 'Águias FC', false],
    ['TEC', 'Tubarões EC', true],
    ['TUX', 'Tubarões EC', false],
  ])('%s em %s → %s', (acronym, name, expected) => {
    expect(isAcronymOfName(acronym, name)).toBe(expected);
  });
});
