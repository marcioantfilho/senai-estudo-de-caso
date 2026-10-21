import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { resourceLocation } from '../../../shared/http/api-routes';
import { JsonObjectBodyPipe } from '../../../shared/http/pipes/json-object-body.pipe';
import { MatchOrder, PlayMatchUseCase } from '../application/play-match.use-case';
import { MatchBodyPipe } from './match-body.pipe';
import { MatchResponse, toMatchResponse } from './match.response';

@Controller('matches')
export class MatchesController {
  constructor(private readonly playMatch: PlayMatchUseCase) {}

  @Post()
  async play(
    @Body(JsonObjectBodyPipe, MatchBodyPipe) order: MatchOrder,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MatchResponse> {
    const match = await this.playMatch.execute(order);
    response.location(resourceLocation('matches', match.id));
    return toMatchResponse(match);
  }
}
