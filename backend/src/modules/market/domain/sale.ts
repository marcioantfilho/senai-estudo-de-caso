import { subtractMoney, sumOfPercentages } from '../../../shared/domain/money';
import { ContractStatus } from './contract-status';
import { ContractTerms, contractStatusAfterSale, describeContract, loyaltyPenalty } from './loyalty';

/** RN16: 10% sobre a parte do lucro até 10,00 e 20% sobre a parte acima. */
const COMMISSION_BRACKET_LIMIT = 10;
const COMMISSION_BRACKET_PERCENT = 10;
const COMMISSION_EXCESS_PERCENT = 20;

export interface SaleSettlement {
  saleValue: number;
  purchaseValue: number;
  remainingDays: number;
  penaltyRate: number;
  penalty: number;
  profit: number;
  commission: number;
  credit: number;
  contractStatus: ContractStatus;
}

/** RN16: lucro = valor de mercado na venda − valor de compra (sem a taxa), com sinal. */
export function saleProfit(saleValue: number, purchaseValue: number): number {
  return subtractMoney(saleValue, purchaseValue);
}

/** RN16: progressiva, arredondada uma única vez; sem lucro, 0,00. */
export function saleCommission(profit: number): number {
  if (profit <= 0) {
    return 0;
  }
  return sumOfPercentages([
    { amount: Math.min(profit, COMMISSION_BRACKET_LIMIT), percent: COMMISSION_BRACKET_PERCENT },
    { amount: Math.max(subtractMoney(profit, COMMISSION_BRACKET_LIMIT), 0), percent: COMMISSION_EXCESS_PERCENT },
  ]);
}

/** RN15 e RN16: multa, lucro, comissão, crédito no caixa e situação final do contrato. */
export function settleSale(saleValue: number, contract: ContractTerms, at: Date): SaleSettlement {
  const { purchaseValue, remainingDays, penaltyRate } = describeContract(contract, at);
  const penalty = loyaltyPenalty(saleValue, penaltyRate);
  const profit = saleProfit(saleValue, purchaseValue);
  const commission = saleCommission(profit);
  return {
    saleValue,
    purchaseValue,
    remainingDays,
    penaltyRate,
    penalty,
    profit,
    commission,
    credit: subtractMoney(saleValue, penalty, commission),
    contractStatus: contractStatusAfterSale(penalty),
  };
}
