import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../shared/http/api.exception';
import { ClubRepository } from '../../clubs/application/club.repository';
import { PlayerRepository } from '../../players/application/player.repository';
import { Transaction } from '../domain/transaction';
import { summarizeTransactions, TransactionSummary } from '../domain/transaction-summary';
import { TransactionFilter, TransactionRepository } from './transaction.repository';

export interface ClubTransactionHistory {
  data: Transaction[];
  summary: TransactionSummary;
}

/** RN17: histórico do clube como foi gravado, com os totais das transações filtradas. */
@Injectable()
export class ListClubTransactionsUseCase {
  constructor(
    private readonly clubs: ClubRepository,
    private readonly players: PlayerRepository,
    private readonly transactions: TransactionRepository,
  ) {}

  async execute(clubId: number, filter: TransactionFilter): Promise<ClubTransactionHistory> {
    if (!(await this.clubs.exists(clubId))) {
      throw new ResourceNotFoundException('Clube não encontrado.');
    }
    if (filter.playerId !== undefined && (await this.players.findActiveById(filter.playerId)) === null) {
      throw new ResourceNotFoundException('Jogador não encontrado.');
    }

    const data = await this.transactions.findByClub(clubId, filter);
    return { data, summary: summarizeTransactions(data) };
  }
}
