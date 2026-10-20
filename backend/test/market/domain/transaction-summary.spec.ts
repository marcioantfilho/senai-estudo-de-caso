import { describe, expect, it } from 'vitest';
import { Transaction } from '../../../src/modules/market/domain/transaction';
import { summarizeTransactions } from '../../../src/modules/market/domain/transaction-summary';

const party = { clubId: 1, playerId: 2, playerName: 'Meia Lua' };
const purchase: Transaction = {
  ...party,
  id: 10,
  type: 'COMPRA',
  value: 37,
  fee: 1.85,
  penalty: 0,
  profit: null,
  cashChange: -38.85,
  createdAt: new Date('2026-11-02T13:15:00.000Z'),
};
const sale: Transaction = {
  ...party,
  id: 11,
  type: 'VENDA',
  value: 40,
  fee: 0.3,
  penalty: 4,
  profit: 3,
  cashChange: 35.7,
  createdAt: new Date('2026-11-05T19:40:00.000Z'),
};

describe('summarizeTransactions (RN17)', () => {
  it('exemplo 2.3.3 sem filtro', () => {
    expect(summarizeTransactions([sale, purchase])).toEqual({
      totalSpent: 38.85,
      totalReceived: 35.7,
      totalFees: 2.15,
      totalPenalties: 4,
      totalProfit: 3,
    });
  });

  it('exemplo 2.3.3 com type=VENDA: total_spent 0,00', () => {
    expect(summarizeTransactions([sale])).toEqual({
      totalSpent: 0,
      totalReceived: 35.7,
      totalFees: 0.3,
      totalPenalties: 4,
      totalProfit: 3,
    });
  });

  it('sem transações, todos os totais 0,00', () => {
    expect(summarizeTransactions([])).toEqual({
      totalSpent: 0,
      totalReceived: 0,
      totalFees: 0,
      totalPenalties: 0,
      totalProfit: 0,
    });
  });

  it('lucro total com sinal e soma exata em centavos', () => {
    const loss = { ...sale, id: 12, value: 42.5, fee: 0, penalty: 8.5, profit: -7.5, cashChange: 34 };
    const small = { ...sale, id: 13, value: 0.1, fee: 0, penalty: 0, profit: 0.1, cashChange: 0.1 };
    const small2 = { ...small, id: 14, value: 0.2, profit: 0.2, cashChange: 0.2 };
    expect(summarizeTransactions([sale, loss, small, small2])).toMatchObject({ totalProfit: -4.2, totalReceived: 70 });
  });
});
