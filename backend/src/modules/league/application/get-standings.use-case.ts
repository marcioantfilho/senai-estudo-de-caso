import { Injectable } from '@nestjs/common';
import { ClubRepository } from '../../clubs/application/club.repository';
import { computeStandings, StandingRow } from '../domain/standings';
import { LeagueRepository } from './league.repository';

/** RN21: classificação calculada a cada consulta, nunca gravada. */
@Injectable()
export class GetStandingsUseCase {
  constructor(
    private readonly league: LeagueRepository,
    private readonly clubs: ClubRepository,
  ) {}

  async execute(): Promise<StandingRow[]> {
    const [clubs, scores] = await Promise.all([this.clubs.findAll(), this.league.findMatchScores()]);
    return computeStandings(clubs, scores);
  }
}
