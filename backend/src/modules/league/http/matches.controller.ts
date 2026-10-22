import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { resourceLocation } from '../../../shared/http/api-routes';
import { JsonObjectBodyPipe } from '../../../shared/http/pipes/json-object-body.pipe';
import { ParseIdPipe } from '../../../shared/http/pipes/parse-id.pipe';
import { GetMatchUseCase } from '../application/get-match.use-case';
import { ListMatchesUseCase } from '../application/list-matches.use-case';
import { MatchOrder, PlayMatchUseCase } from '../application/play-match.use-case';
import { MatchBodyPipe } from './match-body.pipe';
import { MatchResponse, MatchSummaryResponse, toMatchResponse, toMatchSummaryResponse } from './match.response';
import { MatchesQueryPipe } from './matches-query.pipe';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly playMatch: PlayMatchUseCase,
    private readonly listMatches: ListMatchesUseCase,
    private readonly getMatch: GetMatchUseCase,
  ) {}

  @Get()
  async list(@Query(MatchesQueryPipe) clubId: number | undefined): Promise<MatchSummaryResponse[]> {
    return (await this.listMatches.execute(clubId)).map(toMatchSummaryResponse);
  }

  @Post()
  async play(
    @Body(JsonObjectBodyPipe, MatchBodyPipe) order: MatchOrder,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MatchResponse> {
    const match = await this.playMatch.execute(order);
    response.location(resourceLocation('matches', match.id));
    return toMatchResponse(match);
  }

  @Get(':id')
  async findById(@Param('id', ParseIdPipe) id: number): Promise<MatchResponse> {
    return toMatchResponse(await this.getMatch.execute(id));
  }
}
