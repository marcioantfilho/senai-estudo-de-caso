import { describe, expect, it } from 'vitest';
import {
  contractStatusAfterSale,
  describeContract,
  isLoyaltyEndAllowed,
  loyaltyPenalty,
  penaltyRate,
  remainingLoyaltyDays,
} from '../../../src/modules/market/domain/loyalty';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const sale = new Date('2026-11-05T19:40:00.000Z');
const after = (milliseconds: number): Date => new Date(sale.getTime() + milliseconds);

describe('remainingLoyaltyDays e penaltyRate (RN15)', () => {
  it.each([
    ['já passou', -DAY, 0, 0],
    ['é o próprio momento', 0, 0, 0],
    ['1 milissegundo', 1, 1, 5],
    ['10 dias e 2 horas', 10 * DAY + 2 * HOUR, 11, 5],
    ['exatamente 30 dias', 30 * DAY, 30, 5],
    ['30 dias e 1 minuto', 30 * DAY + MINUTE, 31, 10],
    ['exatamente 180 dias', 180 * DAY, 180, 10],
    ['180 dias e 1 minuto', 180 * DAY + MINUTE, 181, 20],
    ['200 dias', 200 * DAY, 200, 20],
  ])('%s → %d dias, %d%%', (_label, offset, days, rate) => {
    const remaining = remainingLoyaltyDays(after(offset), sale);
    expect(remaining).toBe(days);
    expect(penaltyRate(remaining)).toBe(rate);
  });

  it('exemplo da venda do Meia Lua: 116 dias, 17 horas e 35 minutos → 117', () => {
    const loyaltyUntil = new Date('2027-03-02T13:15:00.000Z');
    expect(remainingLoyaltyDays(loyaltyUntil, sale)).toBe(117);
  });
});

describe('isLoyaltyEndAllowed', () => {
  it.each([
    ['no passado', -MINUTE, false],
    ['no próprio instante da compra', 0, false],
    ['1 minuto depois', MINUTE, true],
    ['exatamente 1.095 dias depois', 1_095 * DAY, true],
    ['1.095 dias e 1 milissegundo depois', 1_095 * DAY + 1, false],
    ['1.096 dias depois', 1_096 * DAY, false],
  ])('%s → %s', (_label, offset, allowed) => {
    expect(isLoyaltyEndAllowed(after(offset), sale)).toBe(allowed);
  });
});

describe('loyaltyPenalty e contractStatusAfterSale (RN15)', () => {
  it.each([
    [40, 10, 4],
    [42.5, 20, 8.5],
    [30, 5, 1.5],
    [75, 20, 10],
    [50.01, 20, 10],
    [49.99, 20, 10],
    [49.97, 20, 9.99],
    [25, 0, 0],
    [8.7, 5, 0.44],
  ])('mercado %s × %s%% → %s', (marketValue, rate, penalty) => {
    expect(loyaltyPenalty(marketValue, rate)).toBe(penalty);
  });

  it('com multa, RESCINDIDO; sem multa, ENCERRADO', () => {
    expect(contractStatusAfterSale(4)).toBe('RESCINDIDO');
    expect(contractStatusAfterSale(0)).toBe('ENCERRADO');
  });
});

describe('describeContract', () => {
  it('exemplo 2.2.2: compra em 02/11/2026 10:15 com fidelidade até 02/03/2027 10:15', () => {
    const at = new Date('2026-11-02T13:15:00.000Z');
    const terms = { purchaseValue: 37, loyaltyUntil: new Date('2027-03-02T13:15:00.000Z') };
    expect(describeContract(terms, at)).toEqual({ ...terms, remainingDays: 120, penaltyRate: 10 });
  });
});
