import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../shared/http/api.exception';
import { ClubRepository } from '../../clubs/application/club.repository';
import { MatchSummary } from '../domain/match';
import { LeagueRepository } from './league.repository';

/** RN21: histórico de partidas; com `club_id`, só as partidas em que o clube foi mandante ou visitante. */
@Injectable()
export class ListMatchesUseCase {
  constructor(
    private readonly league: LeagueRepository,
    private readonly clubs: ClubRepository,
  ) {}

  async execute(clubId?: number): Promise<MatchSummary[]> {
    if (clubId !== undefined && !(await this.clubs.exists(clubId))) {
      throw new ResourceNotFoundException('Clube não encontrado.');
    }
    return this.league.findMatches(clubId);
  }
}
