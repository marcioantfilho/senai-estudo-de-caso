import { percentageOf } from '../../../shared/domain/money';
import { PhysicalCondition } from './physical-condition';
import { isYoungProspect } from './young-prospect';

export interface MarketValueInput {
  baseValue: number;
  condition: PhysicalCondition;
  agility: number;
  age: number;
}

/** RN02 */
const CONDITION_DISCOUNT_PERCENT: Record<PhysicalCondition, number> = {
  APTO: 0,
  MAL_CONDICIONADO: 15,
  DOENTE: 30,
};

/** RN03 */
const HIGH_AGILITY_MIN = 80;
const LOW_AGILITY_MAX = 30;
const LOW_AGILITY_EXTRA_DISCOUNT_PERCENT = 10;

/** RN04 */
const VETERAN_MIN_AGE = 32;
const YOUNG_PROSPECT_BONUS_PERCENT = 10;
const VETERAN_DISCOUNT_PERCENT = 10;

/** RN05 */
const MAX_TOTAL_DISCOUNT_PERCENT = 40;
const MINIMUM_MARKET_VALUE = 1;

/** RN05: calculado a cada consulta, a partir do valor base gravado. */
export function calculateMarketValue({ baseValue, condition, agility, age }: MarketValueInput): number {
  const totalPercent = ageAdjustmentPercent(age) - conditionDiscountPercent(condition, agility);
  const cappedPercent = Math.max(totalPercent, -MAX_TOTAL_DISCOUNT_PERCENT);
  const marketValue = percentageOf(baseValue, 100 + cappedPercent);
  return Math.max(marketValue, MINIMUM_MARKET_VALUE);
}

/** RN02 e RN03: a agilidade só altera o desconto de quem não está APTO. */
function conditionDiscountPercent(condition: PhysicalCondition, agility: number): number {
  const discount = CONDITION_DISCOUNT_PERCENT[condition];
  if (condition === 'APTO') {
    return discount;
  }
  if (agility >= HIGH_AGILITY_MIN) {
    return discount / 2;
  }
  if (agility <= LOW_AGILITY_MAX) {
    return discount + LOW_AGILITY_EXTRA_DISCOUNT_PERCENT;
  }
  return discount;
}

/** RN04: pela idade atual, em qualquer condição. */
function ageAdjustmentPercent(age: number): number {
  if (isYoungProspect(age)) {
    return YOUNG_PROSPECT_BONUS_PERCENT;
  }
  if (age >= VETERAN_MIN_AGE) {
    return -VETERAN_DISCOUNT_PERCENT;
  }
  return 0;
}
