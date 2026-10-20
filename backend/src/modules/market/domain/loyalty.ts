const MILLISECONDS_PER_DAY = 86_400_000;

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

/** RN15: dias com fração até o fim da fidelidade, arredondados para cima; 0 se já passou. */
export function remainingLoyaltyDays(loyaltyUntil: Date, at: Date): number {
  const remaining = loyaltyUntil.getTime() - at.getTime();
  return remaining > 0 ? Math.ceil(remaining / MILLISECONDS_PER_DAY) : 0;
}

export function penaltyRate(remainingDays: number): number {
  return PENALTY_BANDS.find((band) => remainingDays <= band.maxDays)?.rate ?? LONG_LOYALTY_RATE;
}

/** RN11: situação do contrato se o jogador fosse vendido em `at`. */
export function describeContract({ purchaseValue, loyaltyUntil }: ContractTerms, at: Date): ContractSnapshot {
  const remainingDays = remainingLoyaltyDays(loyaltyUntil, at);
  return { purchaseValue, loyaltyUntil, remainingDays, penaltyRate: penaltyRate(remainingDays) };
}
