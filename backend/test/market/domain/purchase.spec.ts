import { describe, expect, it } from 'vitest';
import { canAffordPurchase, hasSquadRoom, quotePurchase } from '../../../src/modules/market/domain/purchase';

describe('quotePurchase e canAffordPurchase (RN13)', () => {
  it.each([
    [300, 28, 0, 28, true],
    [300, 30, 0, 30, true],
    [300, 30.01, 1.5, 31.51, true],
    [100, 47.62, 2.38, 50, true],
    [100, 48, 2.4, 50.4, false],
  ])('caixa %s, mercado %s → taxa %s, custo %s, aceita %s', (cash, marketValue, fee, totalCost, accepted) => {
    const quote = quotePurchase(marketValue);
    expect(quote).toEqual({ value: marketValue, fee, totalCost });
    expect(canAffordPurchase(quote.totalCost, cash)).toBe(accepted);
  });

  it('exemplo 2.3.1: mercado 37,00 → taxa 1,85 e custo 38,85', () => {
    expect(quotePurchase(37)).toEqual({ value: 37, fee: 1.85, totalCost: 38.85 });
  });

  it('limite sem arredondar: caixa 261,15 aceita 130,57 e recusa 130,58', () => {
    expect(canAffordPurchase(130.57, 261.15)).toBe(true);
    expect(canAffordPurchase(130.58, 261.15)).toBe(false);
  });

  it('meio da taxa para longe do zero: 30,10 × 5% = 1,505 → 1,51', () => {
    expect(quotePurchase(30.1).fee).toBe(1.51);
  });
});

describe('hasSquadRoom (RN14)', () => {
  it.each([
    [0, true],
    [11, true],
    [12, false],
  ])('elenco com %s → cabe mais um: %s', (squadSize, expected) => {
    expect(hasSquadRoom(squadSize)).toBe(expected);
  });
});
