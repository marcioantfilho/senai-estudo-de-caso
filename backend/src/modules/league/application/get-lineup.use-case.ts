import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../shared/http/api.exception';
import { LeagueRepository } from './league.repository';
import { describeLineup, LineupDetails } from './lineup-details';

@Injectable()
export class GetLineupUseCase {
  constructor(private readonly league: LeagueRepository) {}

  async execute(clubId: number): Promise<LineupDetails> {
    const lineup = await this.league.findLineup(clubId);
    if (lineup === null) {
      throw new ResourceNotFoundException('Clube não encontrado.');
    }
    return describeLineup(lineup);
  }
}
