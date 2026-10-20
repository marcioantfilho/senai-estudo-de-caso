import { formatMoney } from '../../../shared/domain/money';
import { formatBrasiliaDateTime } from '../../../shared/http/brasilia-date-time';
import { Transaction } from '../domain/transaction';

const HEADER = 'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';
const SEPARATOR = ';';
const LINE_END = '\n';
const QUOTE = '"';
const NEEDS_QUOTES = /[;"]/;

/** RN18: cabeçalho e uma linha por transação, na ordem recebida, cada uma terminada em LF. */
export function toTransactionsCsv(transactions: readonly Transaction[]): string {
  return [HEADER, ...transactions.map(toCsvLine)].map((line) => line + LINE_END).join('');
}

function toCsvLine(transaction: Transaction): string {
  return [
    formatBrasiliaDateTime(transaction.createdAt),
    transaction.type,
    escapeCsvText(transaction.playerName),
    formatMoney(transaction.value),
    formatMoney(transaction.fee),
    formatMoney(transaction.penalty),
    transaction.profit === null ? '' : formatMoney(transaction.profit),
    formatMoney(transaction.cashChange),
  ].join(SEPARATOR);
}

/** Texto com `;` ou aspas vai entre aspas duplas, e cada aspa interna é duplicada. */
function escapeCsvText(text: string): string {
  return NEEDS_QUOTES.test(text) ? QUOTE + text.replaceAll(QUOTE, QUOTE + QUOTE) + QUOTE : text;
}
