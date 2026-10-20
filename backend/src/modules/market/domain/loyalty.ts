import { percentageOf } from '../../../shared/domain/money';
import { ContractStatus } from './contract-status';

const MILLISECONDS_PER_DAY = 86_400_000;
const MAX_LOYALTY_DAYS = 1_095;
const MAX_PENALTY = 10;

interface PenaltyBand {
  maxDays: number;
  rate: number;
}

/** RN15: 0 dia → 0%; 1 a 30 → 5%; 31 a 180 → 10%; 181 ou mais → 20%. */
const PENALTY_BANDS: readonly PenaltyBand[] = [
  { maxDays: 0, rate: 0 },
  { maxDays: 30, rate: 5 },
  { maxDays: 180, rate: 10 },
];
const LONG_LOYALTY_RATE = 20;

export interface ContractTerms {
  purchaseValue: number;
  loyaltyUntil: Date;
}

export interface ContractSnapshot extends ContractTerms {
  remainingDays: number;
  penaltyRate: number;
}

/** Fim da fidelidade depois do instante da compra e até 1.095 dias depois dele, inclusive. */
export function isLoyaltyEndAllowed(loyaltyUntil: Date, purchasedAt: Date): boolean {
  const length = loyaltyUntil.getTime() - purchasedAt.getTime();
  return length > 0 && length <= MAX_LOYALTY_DAYS * MILLISECONDS_PER_DAY;
}

/** RN15: dias com fração até o fim da fidelidade, arredondados para cima; 0 se já passou. */
export function remainingLoyaltyDays(loyaltyUntil: Date, at: Date): number {
  const remaining = loyaltyUntil.getTime() - at.getTime();
  return remaining > 0 ? Math.ceil(remaining / MILLISECONDS_PER_DAY) : 0;
}

export function penaltyRate(remainingDays: number): number {
  return PENALTY_BANDS.find((band) => remainingDays <= band.maxDays)?.rate ?? LONG_LOYALTY_RATE;
}

/** RN15: valor de mercado na venda × percentual, arredondado e limitado a 10,00. */
export function loyaltyPenalty(marketValue: number, rate: number): number {
  return Math.min(percentageOf(marketValue, rate), MAX_PENALTY);
}

/** RN15: com multa, RESCINDIDO; com a fidelidade cumprida, ENCERRADO. */
export function contractStatusAfterSale(penalty: number): ContractStatus {
  return penalty > 0 ? 'RESCINDIDO' : 'ENCERRADO';
}

/** RN11: situação do contrato se o jogador fosse vendido em `at`. */
export function describeContract({ purchaseValue, loyaltyUntil }: ContractTerms, at: Date): ContractSnapshot {
  const remainingDays = remainingLoyaltyDays(loyaltyUntil, at);
  return { purchaseValue, loyaltyUntil, remainingDays, penaltyRate: penaltyRate(remainingDays) };
}
