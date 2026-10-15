import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { PlayersModule } from './modules/players/players.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { MarketModule } from './modules/market/market.module';
import { LeagueModule } from './modules/league/league.module';

@Module({
  imports: [DatabaseModule, PlayersModule, ClubsModule, MarketModule, LeagueModule],
})
export class AppModule {}
