import { describe, expect, it } from 'vitest';
import { compareAlphabetically, containsIgnoringCaseAndAccents } from '../../../src/shared/domain/text-comparison';

describe('compareAlphabetically (Premissas, ordem alfabética)', () => {
  it('Épsilon fica entre Delta e Gama', () => {
    expect(['Gama', 'Épsilon', 'Delta'].sort(compareAlphabetically)).toEqual(['Delta', 'Épsilon', 'Gama']);
  });

  it('espaço antes do hífen, e hífen antes das letras', () => {
    expect(['Ana-Maria', 'Anab', 'Ana Lima'].sort(compareAlphabetically)).toEqual(['Ana Lima', 'Ana-Maria', 'Anab']);
  });

  it('Águias FC e Aguias FC empatam', () => {
    expect(compareAlphabetically('Águias FC', 'Aguias FC')).toBe(0);
  });

  it('compara por ponto de código, não por unidade UTF-16', () => {
    expect(compareAlphabetically('a\u{1F600}', 'a～')).toBeGreaterThan(0);
  });
});

describe('containsIgnoringCaseAndAccents (RN07)', () => {
  it.each([
    ['João Silva', 'joao', true],
    ['Meia Lua', 'LUA', true],
    ['Conceição Alves', 'CONCEICAO', true],
    ['Meia Lua', 'sol', false],
  ])('%s contém %s → %s', (name, search, expected) => {
    expect(containsIgnoringCaseAndAccents(name, search)).toBe(expected);
  });
});
