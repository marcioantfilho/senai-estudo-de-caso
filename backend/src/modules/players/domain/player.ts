import { calculateBaseValue } from './base-value';
import { calculateMarketValue } from './market-value';
import { calculateOverall, PlayerAttributes } from './overall';
import { PhysicalCondition } from './physical-condition';
import { Position } from './position';

/** Campos que o `PUT /players/{id}` edita (RN08). */
export interface PlayerProfile {
  name: string;
  position: Position;
  agility: number;
  age: number;
}

export interface PlayerRegistration extends PlayerProfile {
  attributes: PlayerAttributes;
  potential: number;
}

export interface NewPlayer extends PlayerRegistration {
  baseValue: number;
  condition: PhysicalCondition;
  clubId: null;
}

export interface Player extends PlayerRegistration {
  id: number;
  baseValue: number;
  condition: PhysicalCondition;
  clubId: number | null;
}

export interface PlayerDetails extends Player {
  overall: number;
  marketValue: number;
}

/** O jogador nasce livre e APTO, com o valor base calculado uma única vez (RN06). */
export function createPlayer(registration: PlayerRegistration): NewPlayer {
  const overall = calculateOverall(registration.position, registration.attributes);
  const baseValue = calculateBaseValue({
    overall,
    potential: registration.potential,
    ageAtRegistration: registration.age,
  });
  return { ...registration, baseValue, condition: 'APTO', clubId: null };
}

/** Overall (RN06) e valor de mercado (RN05) calculados no momento da consulta. */
export function describePlayer(player: Player): PlayerDetails {
  return {
    ...player,
    overall: calculateOverall(player.position, player.attributes),
    marketValue: calculateMarketValue(player),
  };
}

export function isFree(player: Player): boolean {
  return player.clubId === null;
}
