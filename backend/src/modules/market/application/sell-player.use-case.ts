import { Injectable } from '@nestjs/common';
import { sumMoney } from '../../../shared/domain/money';
import { BusinessRuleException, ResourceNotFoundException } from '../../../shared/http/api.exception';
import { describePlayer } from '../../players/domain/player';
import { SaleSettlement, settleSale } from '../domain/sale';
import { saleTransaction, Transaction } from '../domain/transaction';
import { MarketRepository } from './market.repository';

export interface SaleResult {
  transaction: Transaction;
  settlement: SaleSettlement;
  clubCash: number;
}

/** RN15 e RN16: venda pelo clube atual, pelo valor de mercado do instante, numa única transação. */
@Injectable()
export class SellPlayerUseCase {
  constructor(private readonly market: MarketRepository) {}

  async execute(playerId: number): Promise<SaleResult> {
    const at = new Date();
    return this.market.inTransaction(async (session) => {
      const player = await session.lockActivePlayer(playerId);
      if (player === null) {
        throw new ResourceNotFoundException('Jogador não encontrado.');
      }
      if (player.clubId === null) {
        throw new BusinessRuleException('Jogador livre não pode ser vendido.');
      }

      const club = await session.lockClub(player.clubId);
      const contract = await session.findActiveContract(playerId);
      if (club === null || contract === null) {
        throw new Error(`Jogador ${playerId} está no clube ${player.clubId} sem contrato ativo.`);
      }

      const settlement = settleSale(describePlayer(player).marketValue, contract, at);
      const clubCash = sumMoney([club.cash, settlement.credit]);
      const party = { clubId: club.id, playerId, playerName: player.name };
      const transaction = await session.recordSale({
        transaction: saleTransaction(party, settlement, at),
        contractId: contract.id,
        contractStatus: settlement.contractStatus,
        clubCash,
      });
      return { transaction, settlement, clubCash };
    });
  }
}
