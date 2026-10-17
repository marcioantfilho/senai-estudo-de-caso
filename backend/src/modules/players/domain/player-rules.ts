import { PhysicalCondition } from './physical-condition';
import { isFree, Player, PlayerProfile } from './player';

/** De DOENTE, o jogador não vai direto para APTO. */
export function canChangeCondition(from: PhysicalCondition, to: PhysicalCondition): boolean {
  return !(from === 'DOENTE' && to === 'APTO');
}

/** RN08: a idade não diminui. */
export function isAgeDecrease(player: Player, profile: PlayerProfile): boolean {
  return profile.age < player.age;
}

/** RN08: jogador com clube não muda de posição. */
export function isForbiddenPositionChange(player: Player, profile: PlayerProfile): boolean {
  return !isFree(player) && profile.position !== player.position;
}

/** RN09: só jogador livre pode ser excluído. */
export function canDelete(player: Player): boolean {
  return isFree(player);
}
