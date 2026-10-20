import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { JsonObjectBodyPipe } from '../../../shared/http/pipes/json-object-body.pipe';
import { ParseIdPipe } from '../../../shared/http/pipes/parse-id.pipe';
import { BuyPlayerUseCase, PurchaseOrder } from '../application/buy-player.use-case';
import { SellPlayerUseCase } from '../application/sell-player.use-case';
import { BuyPlayerBodyPipe } from './buy-player-body.pipe';
import { PurchaseResponse, SaleResponse, toPurchaseResponse, toSaleResponse } from './transaction.response';

@Controller('players')
export class MarketController {
  constructor(
    private readonly buyPlayer: BuyPlayerUseCase,
    private readonly sellPlayer: SellPlayerUseCase,
  ) {}

  @Post(':id/buy')
  @HttpCode(HttpStatus.OK)
  async buy(
    @Param('id', ParseIdPipe) playerId: number,
    @Body(JsonObjectBodyPipe, BuyPlayerBodyPipe) order: PurchaseOrder,
  ): Promise<PurchaseResponse> {
    return toPurchaseResponse(await this.buyPlayer.execute(playerId, order));
  }

  /** A venda não tem corpo; um corpo enviado é ignorado (V1). */
  @Post(':id/sell')
  @HttpCode(HttpStatus.OK)
  async sell(@Param('id', ParseIdPipe) playerId: number): Promise<SaleResponse> {
    return toSaleResponse(await this.sellPlayer.execute(playerId));
  }
}
