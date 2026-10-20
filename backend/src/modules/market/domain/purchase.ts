import { isAtMostHalfOf, percentageOf, sumMoney } from '../../../shared/domain/money';

/** RN13: taxa de 5% só quando o valor de mercado é maior que 30,00. */
const FEE_THRESHOLD = 30;
const FEE_PERCENT = 5;

export interface PurchaseQuote {
  value: number;
  fee: number;
  totalCost: number;
}

/** RN12 e RN13: o preço é o valor de mercado no momento; custo total = valor + taxa. */
export function quotePurchase(marketValue: number): PurchaseQuote {
  const fee = marketValue > FEE_THRESHOLD ? percentageOf(marketValue, FEE_PERCENT) : 0;
  return { value: marketValue, fee, totalCost: sumMoney([marketValue, fee]) };
}

/** RN13: o custo total não passa da metade exata do caixa antes da compra; igual é aceito. */
export function canAffordPurchase(totalCost: number, cashBefore: number): boolean {
  return isAtMostHalfOf(totalCost, cashBefore);
}
