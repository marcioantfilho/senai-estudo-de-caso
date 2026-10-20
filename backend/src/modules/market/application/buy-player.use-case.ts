import { Injectable } from '@nestjs/common';
import { formatMoney, subtractMoney } from '../../../shared/domain/money';
import {
  BusinessRuleException,
  InvalidRequestException,
  ResourceNotFoundException,
} from '../../../shared/http/api.exception';
import { describePlayer, isFree } from '../../players/domain/player';
import { isLoyaltyEndAllowed } from '../domain/loyalty';
import { canAffordPurchase, hasSquadRoom, quotePurchase } from '../domain/purchase';
import { purchaseTransaction, Transaction } from '../domain/transaction';
import { ContractRecord, MarketRepository } from './market.repository';

export interface PurchaseOrder {
  clubId: number;
  loyaltyUntil: Date;
}

export interface PurchaseResult {
  transaction: Transaction;
  contract: ContractRecord;
  clubCash: number;
}

/** RN12 a RN14: compra pelo valor de mercado do instante, numa única transação. */
@Injectable()
export class BuyPlayerUseCase {
  constructor(private readonly market: MarketRepository) {}

  async execute(playerId: number, { clubId, loyaltyUntil }: PurchaseOrder): Promise<PurchaseResult> {
    const at = new Date();
    if (!isLoyaltyEndAllowed(loyaltyUntil, at)) {
      throw new InvalidRequestException(
        'O campo loyalty_until deve ser depois do momento da compra e até 1.095 dias depois dele.',
      );
    }

    return this.market.inTransaction(async (session) => {
      const player = await session.lockActivePlayer(playerId);
      if (player === null) {
        throw new ResourceNotFoundException('Jogador não encontrado.');
      }
      const club = await session.lockClub(clubId);
      if (club === null) {
        throw new ResourceNotFoundException('Clube não encontrado.');
      }

      if (!isFree(player)) {
        throw new BusinessRuleException('Só jogador livre pode ser comprado.');
      }
      if (await session.hasSold(clubId, playerId)) {
        throw new BusinessRuleException('O clube não pode comprar um jogador que ele mesmo já vendeu.');
      }
      if (!hasSquadRoom(await session.countSquad(clubId))) {
        throw new BusinessRuleException('O elenco do clube já tem 12 jogadores.');
      }

      const quote = quotePurchase(describePlayer(player).marketValue);
      if (!canAffordPurchase(quote.totalCost, club.cash)) {
        throw new BusinessRuleException(
          `O custo da compra (${formatMoney(quote.totalCost)}) passa de 50% do caixa (${formatMoney(club.cash)}).`,
        );
      }

      const contract: ContractRecord = { purchaseValue: quote.value, loyaltyUntil, status: 'ATIVO' };
      const clubCash = subtractMoney(club.cash, quote.totalCost);
      const party = { clubId, playerId, playerName: player.name };
      const transaction = await session.recordPurchase({
        transaction: purchaseTransaction(party, quote, at),
        contract,
        clubCash,
      });
      return { transaction, contract, clubCash };
    });
  }
}
