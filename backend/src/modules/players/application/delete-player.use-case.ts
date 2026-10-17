import { Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../../shared/http/api.exception';
import { canDelete } from '../domain/player-rules';
import { findActivePlayerOrFail } from './find-active-player';
import { PlayerRepository } from './player.repository';

/** RN09: exclusão lógica; nada é apagado do banco. */
@Injectable()
export class DeletePlayerUseCase {
  constructor(private readonly players: PlayerRepository) {}

  async execute(id: number): Promise<void> {
    const player = await findActivePlayerOrFail(this.players, id);
    if (!canDelete(player)) {
      throw new BusinessRuleException('Só jogador livre pode ser excluído.');
    }

    await this.players.markDeleted(id, new Date());
  }
}
