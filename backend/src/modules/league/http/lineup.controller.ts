import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { JsonObjectBodyPipe } from '../../../shared/http/pipes/json-object-body.pipe';
import { ParseIdPipe } from '../../../shared/http/pipes/parse-id.pipe';
import { GetLineupUseCase } from '../application/get-lineup.use-case';
import { LineupOrder, SetLineupUseCase } from '../application/set-lineup.use-case';
import { LineupBodyPipe } from './lineup-body.pipe';
import { LineupResponse, toLineupResponse } from './lineup.response';

@Controller('clubs')
export class LineupController {
  constructor(
    private readonly setLineup: SetLineupUseCase,
    private readonly getLineup: GetLineupUseCase,
  ) {}

  @Put(':id/lineup')
  async set(
    @Param('id', ParseIdPipe) clubId: number,
    @Body(JsonObjectBodyPipe, LineupBodyPipe) order: LineupOrder,
  ): Promise<LineupResponse> {
    return toLineupResponse(await this.setLineup.execute(clubId, order));
  }

  @Get(':id/lineup')
  async find(@Param('id', ParseIdPipe) clubId: number): Promise<LineupResponse> {
    return toLineupResponse(await this.getLineup.execute(clubId));
  }
}
