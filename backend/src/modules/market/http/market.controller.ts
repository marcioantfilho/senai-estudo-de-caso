import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { JsonObjectBodyPipe } from '../../../shared/http/pipes/json-object-body.pipe';
import { ParseIdPipe } from '../../../shared/http/pipes/parse-id.pipe';
import { BuyPlayerUseCase, PurchaseOrder } from '../application/buy-player.use-case';
import { BuyPlayerBodyPipe } from './buy-player-body.pipe';
import { PurchaseResponse, toPurchaseResponse } from './transaction.response';

@Controller('players')
export class MarketController {
  constructor(private readonly buyPlayer: BuyPlayerUseCase) {}

  @Post(':id/buy')
  @HttpCode(HttpStatus.OK)
  async buy(
    @Param('id', ParseIdPipe) playerId: number,
    @Body(JsonObjectBodyPipe, BuyPlayerBodyPipe) order: PurchaseOrder,
  ): Promise<PurchaseResponse> {
    return toPurchaseResponse(await this.buyPlayer.execute(playerId, order));
  }
}
