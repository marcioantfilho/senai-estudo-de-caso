import { describe, expect, it } from 'vitest';
import { quotePurchase } from '../../../src/modules/market/domain/purchase';
import { settleSale } from '../../../src/modules/market/domain/sale';
import { purchaseTransaction, saleTransaction } from '../../../src/modules/market/domain/transaction';

describe('purchaseTransaction (RN17)', () => {
  it('exemplo 2.3.1: COMPRA com multa 0,00, lucro nulo e variação −38,85', () => {
    const at = new Date('2026-11-02T13:15:00.000Z');
    const party = { clubId: 1, playerId: 2, playerName: 'Meia Lua' };
    expect(purchaseTransaction(party, quotePurchase(37), at)).toEqual({
      ...party,
      type: 'COMPRA',
      value: 37,
      fee: 1.85,
      penalty: 0,
      profit: null,
      cashChange: -38.85,
      createdAt: at,
    });
  });
});

describe('saleTransaction (RN17)', () => {
  it('exemplo 2.3.2: VENDA com comissão em fee, multa, lucro e variação igual ao crédito', () => {
    const at = new Date('2026-11-05T19:40:00.000Z');
    const contract = { purchaseValue: 37, loyaltyUntil: new Date('2027-03-02T13:15:00.000Z') };
    const party = { clubId: 1, playerId: 2, playerName: 'Meia Lua' };
    expect(saleTransaction(party, settleSale(40, contract, at), at)).toEqual({
      ...party,
      type: 'VENDA',
      value: 40,
      fee: 0.3,
      penalty: 4,
      profit: 3,
      cashChange: 35.7,
      createdAt: at,
    });
  });

  it('prejuízo mantém o sinal no lucro', () => {
    const at = new Date('2026-11-05T19:40:00.000Z');
    const contract = { purchaseValue: 50, loyaltyUntil: new Date(at.getTime() + 200 * 86_400_000) };
    const party = { clubId: 1, playerId: 2, playerName: 'Meia Lua' };
    expect(saleTransaction(party, settleSale(42.5, contract, at), at)).toMatchObject({ profit: -7.5, fee: 0, penalty: 8.5, cashChange: 34 });
  });
});
