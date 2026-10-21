import { Module } from '@nestjs/common';
import { GetLineupUseCase } from './application/get-lineup.use-case';
import { LeagueRepository } from './application/league.repository';
import { PlayMatchUseCase } from './application/play-match.use-case';
import { SetLineupUseCase } from './application/set-lineup.use-case';
import { LineupController } from './http/lineup.controller';
import { MatchesController } from './http/matches.controller';
import { PrismaLeagueRepository } from './infrastructure/prisma-league.repository';

@Module({
  controllers: [LineupController, MatchesController],
  providers: [
    { provide: LeagueRepository, useClass: PrismaLeagueRepository },
    SetLineupUseCase,
    GetLineupUseCase,
    PlayMatchUseCase,
  ],
})
export class LeagueModule {}
