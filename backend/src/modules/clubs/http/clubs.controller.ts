import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { resourceLocation } from '../../../shared/http/api-routes';
import { JsonObjectBodyPipe } from '../../../shared/http/pipes/json-object-body.pipe';
import { CreateClubUseCase } from '../application/create-club.use-case';
import { ClubRegistration } from '../domain/club';
import { ClubResponse, toClubResponse } from './club.response';
import { CreateClubBodyPipe } from './create-club-body.pipe';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly createClub: CreateClubUseCase) {}

  @Post()
  async create(
    @Body(JsonObjectBodyPipe, CreateClubBodyPipe) registration: ClubRegistration,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ClubResponse> {
    const club = await this.createClub.execute(registration);
    response.location(resourceLocation('clubs', club.id));
    return toClubResponse(club);
  }
}
