import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { resourceLocation } from '../../../shared/http/api-routes';
import { PageResponse, toPageResponse } from '../../../shared/http/page.response';
import { JsonObjectBodyPipe } from '../../../shared/http/pipes/json-object-body.pipe';
import { ParseIdPipe } from '../../../shared/http/pipes/parse-id.pipe';
import { ChangePlayerConditionUseCase } from '../application/change-player-condition.use-case';
import { DeletePlayerUseCase } from '../application/delete-player.use-case';
import { GetPlayerUseCase } from '../application/get-player.use-case';
import { ListPlayersUseCase, PlayerListQuery } from '../application/list-players.use-case';
import { RegisterPlayerUseCase } from '../application/register-player.use-case';
import { UpdatePlayerUseCase } from '../application/update-player.use-case';
import { PhysicalCondition } from '../domain/physical-condition';
import { PlayerProfile, PlayerRegistration } from '../domain/player';
import { ListPlayersQueryPipe } from './list-players-query.pipe';
import { ChangeConditionBodyPipe, RegisterPlayerBodyPipe, UpdatePlayerBodyPipe } from './player-body.pipes';
import { PlayerResponse, toPlayerResponse } from './player.response';

@Controller('players')
export class PlayersController {
  constructor(
    private readonly registerPlayer: RegisterPlayerUseCase,
    private readonly listPlayers: ListPlayersUseCase,
    private readonly getPlayer: GetPlayerUseCase,
    private readonly updatePlayer: UpdatePlayerUseCase,
    private readonly changePlayerCondition: ChangePlayerConditionUseCase,
    private readonly deletePlayer: DeletePlayerUseCase,
  ) {}

  @Post()
  async register(
    @Body(JsonObjectBodyPipe, RegisterPlayerBodyPipe) registration: PlayerRegistration,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PlayerResponse> {
    const player = await this.registerPlayer.execute(registration);
    response.location(resourceLocation('players', player.id));
    return toPlayerResponse(player);
  }

  @Get()
  async list(@Query(ListPlayersQueryPipe) query: PlayerListQuery): Promise<PageResponse<PlayerResponse>> {
    return toPageResponse(await this.listPlayers.execute(query), toPlayerResponse);
  }

  @Get(':id')
  async findById(@Param('id', ParseIdPipe) id: number): Promise<PlayerResponse> {
    return toPlayerResponse(await this.getPlayer.execute(id));
  }

  @Put(':id')
  async update(
    @Param('id', ParseIdPipe) id: number,
    @Body(JsonObjectBodyPipe, UpdatePlayerBodyPipe) profile: PlayerProfile,
  ): Promise<PlayerResponse> {
    return toPlayerResponse(await this.updatePlayer.execute(id, profile));
  }

  @Patch(':id/condition')
  async changeCondition(
    @Param('id', ParseIdPipe) id: number,
    @Body(JsonObjectBodyPipe, ChangeConditionBodyPipe) condition: PhysicalCondition,
  ): Promise<PlayerResponse> {
    return toPlayerResponse(await this.changePlayerCondition.execute(id, condition));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIdPipe) id: number): Promise<void> {
    await this.deletePlayer.execute(id);
  }
}
