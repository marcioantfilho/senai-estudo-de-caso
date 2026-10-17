import { Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../../shared/http/api.exception';
import { describePlayer, PlayerDetails, PlayerProfile } from '../domain/player';
import { isAgeDecrease, isForbiddenPositionChange } from '../domain/player-rules';
import { findActivePlayerOrFail } from './find-active-player';
import { PlayerRepository } from './player.repository';

/** RN08: muda só nome, posição, agilidade e idade; indicadores e valor base continuam os do cadastro. */
@Injectable()
export class UpdatePlayerUseCase {
  constructor(private readonly players: PlayerRepository) {}

  async execute(id: number, profile: PlayerProfile): Promise<PlayerDetails> {
    const player = await findActivePlayerOrFail(this.players, id);
    if (isAgeDecrease(player, profile)) {
      throw new BusinessRuleException(`A idade não pode ser menor que a atual (${player.age}).`);
    }
    if (isForbiddenPositionChange(player, profile)) {
      throw new BusinessRuleException('Jogador com clube não pode mudar de posição.');
    }

    return describePlayer(await this.players.updateProfile(id, profile));
  }
}
