import { Module } from '@nestjs/common';
import { GetLineupUseCase } from './application/get-lineup.use-case';
import { LeagueRepository } from './application/league.repository';
import { SetLineupUseCase } from './application/set-lineup.use-case';
import { LineupController } from './http/lineup.controller';
import { PrismaLeagueRepository } from './infrastructure/prisma-league.repository';

@Module({
  controllers: [LineupController],
  providers: [{ provide: LeagueRepository, useClass: PrismaLeagueRepository }, SetLineupUseCase, GetLineupUseCase],
})
export class LeagueModule {}
