import { Controller, Get } from '@nestjs/common';
import { GetStandingsUseCase } from '../application/get-standings.use-case';
import { StandingResponse, toStandingResponse } from './standing.response';

@Controller('standings')
export class StandingsController {
  constructor(private readonly getStandings: GetStandingsUseCase) {}

  @Get()
  async list(): Promise<StandingResponse[]> {
    return (await this.getStandings.execute()).map(toStandingResponse);
  }
}
