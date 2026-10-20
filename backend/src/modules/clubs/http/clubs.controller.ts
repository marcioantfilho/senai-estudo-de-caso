import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { resourceLocation } from '../../../shared/http/api-routes';
import { JsonObjectBodyPipe } from '../../../shared/http/pipes/json-object-body.pipe';
import { ParseIdPipe } from '../../../shared/http/pipes/parse-id.pipe';
import { CreateClubUseCase } from '../application/create-club.use-case';
import { GetClubUseCase } from '../application/get-club.use-case';
import { ListClubsUseCase } from '../application/list-clubs.use-case';
import { ClubRegistration } from '../domain/club';
import { ClubSortOption } from '../domain/club-sort';
import { ClubDetailsResponse, ClubResponse, toClubDetailsResponse, toClubResponse } from './club.response';
import { CreateClubBodyPipe } from './create-club-body.pipe';
import { ListClubsQueryPipe } from './list-clubs-query.pipe';

@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly createClub: CreateClubUseCase,
    private readonly listClubs: ListClubsUseCase,
    private readonly getClub: GetClubUseCase,
  ) {}

  @Get()
  async list(@Query(ListClubsQueryPipe) sort: ClubSortOption): Promise<ClubResponse[]> {
    return (await this.listClubs.execute(sort)).map(toClubResponse);
  }

  @Post()
  async create(
    @Body(JsonObjectBodyPipe, CreateClubBodyPipe) registration: ClubRegistration,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ClubResponse> {
    const club = await this.createClub.execute(registration);
    response.location(resourceLocation('clubs', club.id));
    return toClubResponse(club);
  }

  @Get(':id')
  async findById(@Param('id', ParseIdPipe) id: number): Promise<ClubDetailsResponse> {
    return toClubDetailsResponse(await this.getClub.execute(id));
  }
}
