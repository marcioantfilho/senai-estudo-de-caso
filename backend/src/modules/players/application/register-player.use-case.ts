import { Injectable } from '@nestjs/common';
import { createPlayer, describePlayer, PlayerDetails, PlayerRegistration } from '../domain/player';
import { PlayerRepository } from './player.repository';

@Injectable()
export class RegisterPlayerUseCase {
  constructor(private readonly players: PlayerRepository) {}

  async execute(registration: PlayerRegistration): Promise<PlayerDetails> {
    const player = await this.players.create(createPlayer(registration));
    return describePlayer(player);
  }
}
