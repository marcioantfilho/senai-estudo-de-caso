import { Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../../shared/http/api.exception';
import { PhysicalCondition } from '../domain/physical-condition';
import { describePlayer, PlayerDetails } from '../domain/player';
import { canChangeCondition } from '../domain/player-rules';
import { findActivePlayerOrFail } from './find-active-player';
import { PlayerRepository } from './player.repository';

@Injectable()
export class ChangePlayerConditionUseCase {
  constructor(private readonly players: PlayerRepository) {}

  async execute(id: number, condition: PhysicalCondition): Promise<PlayerDetails> {
    const player = await findActivePlayerOrFail(this.players, id);
    if (condition === player.condition) {
      return describePlayer(player);
    }
    if (!canChangeCondition(player.condition, condition)) {
      throw new BusinessRuleException('O jogador DOENTE não pode passar direto para APTO.');
    }

    return describePlayer(await this.players.updateCondition(id, condition));
  }
}
