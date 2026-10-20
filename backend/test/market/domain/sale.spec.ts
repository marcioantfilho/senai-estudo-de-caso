import { describe, expect, it } from 'vitest';
import { saleCommission, saleProfit, settleSale } from '../../../src/modules/market/domain/sale';

const DAY = 86_400_000;
const sale = new Date('2026-11-05T19:40:00.000Z');
const loyaltyIn = (milliseconds: number): Date => new Date(sale.getTime() + milliseconds);

describe('saleCommission (RN16)', () => {
  it.each([
    [3, 0.3],
    [3.85, 0.39],
    [10, 1],
    [10.01, 1],
    [15, 2],
    [-7.5, 0],
    [0, 0],
  ])('lucro %s → comissão %s', (profit, commission) => {
    expect(saleCommission(profit)).toBe(commission);
  });
});

describe('saleProfit (RN16)', () => {
  it('prejuízo preserva o sinal', () => {
    expect(saleProfit(42.5, 50)).toBe(-7.5);
  });
});

describe('settleSale (RN15 e RN16)', () => {
  it.each([
    [37, 40, 100 * DAY, 10, 4, 3, 0.3, 35.7, 'RESCINDIDO'],
    [50, 42.5, 200 * DAY, 20, 8.5, -7.5, 0, 34, 'RESCINDIDO'],
    [26.15, 30, 10 * DAY, 5, 1.5, 3.85, 0.39, 28.11, 'RESCINDIDO'],
    [25, 25, -DAY, 0, 0, 0, 0, 25, 'ENCERRADO'],
    [60, 75, 365 * DAY, 20, 10, 15, 2, 63, 'RESCINDIDO'],
  ])(
    'compra %s, venda %s → multa %s%% = %s, lucro %s, comissão %s, crédito %s, %s',
    (purchaseValue, saleValue, loyaltyOffset, penaltyRate, penalty, profit, commission, credit, contractStatus) => {
      const settlement = settleSale(saleValue, { purchaseValue, loyaltyUntil: loyaltyIn(loyaltyOffset) }, sale);
      expect(settlement).toMatchObject({ penaltyRate, penalty, profit, commission, credit, contractStatus });
    },
  );

  it('exemplo 2.3.2 (Meia Lua): 117 dias, multa 4,00, crédito 35,70', () => {
    const contract = { purchaseValue: 37, loyaltyUntil: new Date('2027-03-02T13:15:00.000Z') };
    expect(settleSale(40, contract, sale)).toEqual({
      saleValue: 40,
      purchaseValue: 37,
      remainingDays: 117,
      penaltyRate: 10,
      penalty: 4,
      profit: 3,
      commission: 0.3,
      credit: 35.7,
      contractStatus: 'RESCINDIDO',
    });
  });

  it('fidelidade cumprida no próprio instante → 0 dia e ENCERRADO', () => {
    expect(settleSale(40, { purchaseValue: 37, loyaltyUntil: sale }, sale)).toMatchObject({
      remainingDays: 0,
      penalty: 0,
      contractStatus: 'ENCERRADO',
    });
  });

  it('multa no piso do mercado: 1,00 × 5% = 0,05 → RESCINDIDO', () => {
    expect(settleSale(1, { purchaseValue: 1, loyaltyUntil: loyaltyIn(DAY) }, sale)).toMatchObject({
      penalty: 0.05,
      credit: 0.95,
      contractStatus: 'RESCINDIDO',
    });
  });
});
