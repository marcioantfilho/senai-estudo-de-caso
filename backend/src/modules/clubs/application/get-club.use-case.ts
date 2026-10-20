import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../shared/http/api.exception';
import { ContractRepository } from '../../market/application/contract.repository';
import { PlayerRepository } from '../../players/application/player.repository';
import { describePlayer } from '../../players/domain/player';
import { summarizeClub } from '../domain/club';
import { buildSquad, ClubDetails } from '../domain/club-squad';
import { ClubRepository } from './club.repository';

@Injectable()
export class GetClubUseCase {
  constructor(
    private readonly clubs: ClubRepository,
    private readonly players: PlayerRepository,
    private readonly contracts: ContractRepository,
  ) {}

  async execute(id: number): Promise<ClubDetails> {
    const club = await this.clubs.findById(id);
    if (club === null) {
      throw new ResourceNotFoundException('Clube não encontrado.');
    }

    const at = new Date();
    const [players, contracts] = await Promise.all([
      this.players.findActive({ clubId: id }),
      this.contracts.findActiveByClub(id),
    ]);
    const squad = players.map(describePlayer);
    return { ...summarizeClub(club, squad), squad: buildSquad(squad, contracts, at) };
  }
}
