import { Module } from '@nestjs/common';
import { ChangePlayerConditionUseCase } from './application/change-player-condition.use-case';
import { DeletePlayerUseCase } from './application/delete-player.use-case';
import { GetPlayerUseCase } from './application/get-player.use-case';
import { PlayerRepository } from './application/player.repository';
import { RegisterPlayerUseCase } from './application/register-player.use-case';
import { UpdatePlayerUseCase } from './application/update-player.use-case';
import { PlayersController } from './http/players.controller';
import { PrismaPlayerRepository } from './infrastructure/prisma-player.repository';

@Module({
  controllers: [PlayersController],
  providers: [
    { provide: PlayerRepository, useClass: PrismaPlayerRepository },
    RegisterPlayerUseCase,
    GetPlayerUseCase,
    UpdatePlayerUseCase,
    ChangePlayerConditionUseCase,
    DeletePlayerUseCase,
  ],
})
export class PlayersModule {}
