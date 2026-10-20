import { Player as PlayerRow } from '@prisma/client';
import { PhysicalCondition } from '../domain/physical-condition';
import { Player } from '../domain/player';
import { Position } from '../domain/position';

export function toPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    name: row.name,
    position: row.position as Position,
    agility: row.agility,
    age: row.age,
    baseValue: row.baseValue.toNumber(),
    condition: row.condition as PhysicalCondition,
    clubId: row.clubId,
    attributes: {
      pace: row.pace,
      shooting: row.shooting,
      passing: row.passing,
      dribbling: row.dribbling,
      defending: row.defending,
      physical: row.physical,
    },
    potential: row.potential,
  };
}
