import { Module } from '@nestjs/common';
import { ClubPersistenceModule } from '../clubs/infrastructure/club-persistence.module';
import { GetLineupUseCase } from './application/get-lineup.use-case';
import { GetMatchUseCase } from './application/get-match.use-case';
import { GetStandingsUseCase } from './application/get-standings.use-case';
import { LeagueRepository } from './application/league.repository';
import { ListMatchesUseCase } from './application/list-matches.use-case';
import { PlayMatchUseCase } from './application/play-match.use-case';
import { SetLineupUseCase } from './application/set-lineup.use-case';
import { LineupController } from './http/lineup.controller';
import { MatchesController } from './http/matches.controller';
import { StandingsController } from './http/standings.controller';
import { PrismaLeagueRepository } from './infrastructure/prisma-league.repository';

@Module({
  imports: [ClubPersistenceModule],
  controllers: [LineupController, MatchesController, StandingsController],
  providers: [
    { provide: LeagueRepository, useClass: PrismaLeagueRepository },
    SetLineupUseCase,
    GetLineupUseCase,
    PlayMatchUseCase,
    ListMatchesUseCase,
    GetMatchUseCase,
    GetStandingsUseCase,
  ],
})
export class LeagueModule {}
