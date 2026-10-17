import { Module } from '@nestjs/common';
import { ClubsModule } from '../clubs/clubs.module';
import { ChangePlayerConditionUseCase } from './application/change-player-condition.use-case';
import { DeletePlayerUseCase } from './application/delete-player.use-case';
import { GetPlayerUseCase } from './application/get-player.use-case';
import { ListPlayersUseCase } from './application/list-players.use-case';
import { PlayerRepository } from './application/player.repository';
import { RegisterPlayerUseCase } from './application/register-player.use-case';
import { UpdatePlayerUseCase } from './application/update-player.use-case';
import { PlayersController } from './http/players.controller';
import { PrismaPlayerRepository } from './infrastructure/prisma-player.repository';

@Module({
  imports: [ClubsModule],
  controllers: [PlayersController],
  providers: [
    { provide: PlayerRepository, useClass: PrismaPlayerRepository },
    RegisterPlayerUseCase,
    ListPlayersUseCase,
    GetPlayerUseCase,
    UpdatePlayerUseCase,
    ChangePlayerConditionUseCase,
    DeletePlayerUseCase,
  ],
})
export class PlayersModule {}
