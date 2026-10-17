import { roundedDivision } from '../../../shared/domain/rounding';
import { Position } from './position';

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

const WEIGHT_TOTAL = 100;

/** RN06: pesos (%) de cada atributo por posição; cada posição soma 100. */
const ATTRIBUTE_WEIGHTS: Record<Position, PlayerAttributes> = {
  GOL: { pace: 10, shooting: 0, passing: 20, dribbling: 0, defending: 40, physical: 30 },
  ZAG: { pace: 10, shooting: 0, passing: 15, dribbling: 0, defending: 45, physical: 30 },
  LAT: { pace: 25, shooting: 0, passing: 20, dribbling: 15, defending: 25, physical: 15 },
  MEI: { pace: 10, shooting: 15, passing: 35, dribbling: 25, defending: 5, physical: 10 },
  ATA: { pace: 20, shooting: 40, passing: 10, dribbling: 20, defending: 0, physical: 10 },
};

/** RN06: média ponderada pela posição, arredondada para o inteiro com o meio para cima. */
export function calculateOverall(position: Position, attributes: PlayerAttributes): number {
  const weights = ATTRIBUTE_WEIGHTS[position];
  const attributeNames = Object.keys(weights) as (keyof PlayerAttributes)[];
  const weightedSum = attributeNames.reduce((sum, name) => sum + attributes[name] * weights[name], 0);
  return roundedDivision(weightedSum, WEIGHT_TOTAL);
}
