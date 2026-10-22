import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../shared/http/api.exception';
import { RecordedMatch } from '../domain/match';
import { LeagueRepository } from './league.repository';

@Injectable()
export class GetMatchUseCase {
  constructor(private readonly league: LeagueRepository) {}

  async execute(id: number): Promise<RecordedMatch> {
    const match = await this.league.findMatch(id);
    if (match === null) {
      throw new ResourceNotFoundException('Partida não encontrada.');
    }
    return match;
  }
}
