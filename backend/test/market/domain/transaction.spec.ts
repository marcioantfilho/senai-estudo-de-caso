import { describe, expect, it } from 'vitest';
import { quotePurchase } from '../../../src/modules/market/domain/purchase';
import { purchaseTransaction } from '../../../src/modules/market/domain/transaction';

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
