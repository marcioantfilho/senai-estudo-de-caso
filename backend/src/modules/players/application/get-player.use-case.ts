import { Injectable } from '@nestjs/common';
import { describePlayer, PlayerDetails } from '../domain/player';
import { findActivePlayerOrFail } from './find-active-player';
import { PlayerRepository } from './player.repository';

@Injectable()
export class GetPlayerUseCase {
  constructor(private readonly players: PlayerRepository) {}

  async execute(id: number): Promise<PlayerDetails> {
    return describePlayer(await findActivePlayerOrFail(this.players, id));
  }
}
