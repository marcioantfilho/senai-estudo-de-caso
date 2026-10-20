import { describe, expect, it } from 'vitest';
import { Transaction } from '../../../src/modules/market/domain/transaction';
import { toTransactionsCsv } from '../../../src/modules/market/http/transactions-csv';

const HEADER = 'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n';
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

describe('toTransactionsCsv (RN18)', () => {
  it('exemplo oficial, na ordem recebida, com LF em todas as linhas', () => {
    expect(toTransactionsCsv([sale, purchase])).toBe(
      HEADER +
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
    );
  });

  it('sem transações: só a linha de cabeçalho', () => {
    expect(toTransactionsCsv([])).toBe(HEADER);
  });

  it.each([
    ['Zé "Foguete" Lima', '"Zé ""Foguete"" Lima"'],
    ['Ana;Bia Costa', '"Ana;Bia Costa"'],
    ['Ana "Bia;" Costa', '"Ana ""Bia;"" Costa"'],
    ['Zé Lima', 'Zé Lima'],
  ])('nome %s → %s', (playerName, cell) => {
    const [, line] = toTransactionsCsv([{ ...purchase, playerName }]).split('\n');
    expect(line?.split(';').length).toBeGreaterThanOrEqual(8);
    expect(line).toContain(`;COMPRA;${cell};37,00;`);
  });

  it('prejuízo com sinal negativo', () => {
    const loss = { ...sale, value: 42.5, fee: 0, penalty: 8.5, profit: -7.5, cashChange: 34 };
    expect(toTransactionsCsv([loss])).toContain(';VENDA;Meia Lua;42,50;0,00;8,50;-7,50;34,00\n');
  });
});
