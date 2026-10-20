import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParseIdPipe } from '../../../shared/http/pipes/parse-id.pipe';
import { ListClubTransactionsUseCase } from '../application/list-club-transactions.use-case';
import { TransactionFilter } from '../application/transaction.repository';
import { TransactionFilterQueryPipe } from './transaction-filter-query.pipe';
import { toTransactionHistoryResponse, TransactionHistoryResponse } from './transaction.response';

@Controller('clubs')
export class ClubTransactionsController {
  constructor(private readonly listClubTransactions: ListClubTransactionsUseCase) {}

  @Get(':id/transactions')
  async list(
    @Param('id', ParseIdPipe) clubId: number,
    @Query(TransactionFilterQueryPipe) filter: TransactionFilter,
  ): Promise<TransactionHistoryResponse> {
    return toTransactionHistoryResponse(await this.listClubTransactions.execute(clubId, filter));
  }
}
