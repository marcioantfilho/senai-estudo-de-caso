import { Module } from '@nestjs/common';
import { PlayersModule } from './modules/players/players.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { MarketModule } from './modules/market/market.module';
import { LeagueModule } from './modules/league/league.module';

@Module({
  imports: [PlayersModule, ClubsModule, MarketModule, LeagueModule],
})
export class AppModule {}
