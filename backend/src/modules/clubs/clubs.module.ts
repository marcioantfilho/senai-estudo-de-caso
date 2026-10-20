import { Module } from '@nestjs/common';
import { MarketModule } from '../market/market.module';
import { PlayersModule } from '../players/players.module';
import { CreateClubUseCase } from './application/create-club.use-case';
import { GetClubUseCase } from './application/get-club.use-case';
import { ListClubsUseCase } from './application/list-clubs.use-case';
import { ClubsController } from './http/clubs.controller';
import { ClubPersistenceModule } from './infrastructure/club-persistence.module';

@Module({
  imports: [ClubPersistenceModule, PlayersModule, MarketModule],
  controllers: [ClubsController],
  providers: [CreateClubUseCase, ListClubsUseCase, GetClubUseCase],
})
export class ClubsModule {}
