import { ResourceNotFoundException } from '../../../shared/http/api.exception';
import { Player } from '../domain/player';
import { PlayerRepository } from './player.repository';

/** V8 e RN09: jogador inexistente ou excluído → 404. */
export async function findActivePlayerOrFail(players: PlayerRepository, id: number): Promise<Player> {
  const player = await players.findActiveById(id);
  if (player === null) {
    throw new ResourceNotFoundException('Jogador não encontrado.');
  }
  return player;
}
