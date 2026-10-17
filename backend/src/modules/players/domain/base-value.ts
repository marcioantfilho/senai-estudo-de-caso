import { fromCents, percentageOf } from '../../../shared/domain/money';
import { isYoungProspect } from './young-prospect';

export interface BaseValueInput {
  overall: number;
  potential: number;
  ageAtRegistration: number;
}

interface OverallBand {
  firstPoint: number;
  lastPoint: number;
  centsPerPoint: number;
}

/** RN06: 0,50 por ponto de 41 a 60, 2,00 de 61 a 75 e 6,00 de 76 a 99. */
const OVERALL_BANDS: readonly OverallBand[] = [
  { firstPoint: 41, lastPoint: 60, centsPerPoint: 50 },
  { firstPoint: 61, lastPoint: 75, centsPerPoint: 200 },
  { firstPoint: 76, lastPoint: 99, centsPerPoint: 600 },
];

const MINIMUM_BASE_VALUE = 1;

/** RN06: calculado uma única vez, no cadastro, e gravado. */
export function calculateBaseValue({ overall, potential, ageAtRegistration }: BaseValueInput): number {
  const overallPart = fromCents(overallPartInCents(overall));
  const youngProspectPercent = 100 + potential - overall;
  const baseValue = isYoungProspect(ageAtRegistration) ? percentageOf(overallPart, youngProspectPercent) : overallPart;
  return Math.max(baseValue, MINIMUM_BASE_VALUE);
}

function overallPartInCents(overall: number): number {
  return OVERALL_BANDS.reduce((total, band) => {
    const pointsInBand = Math.min(overall, band.lastPoint) - band.firstPoint + 1;
    return total + Math.max(pointsInBand, 0) * band.centsPerPoint;
  }, 0);
}
