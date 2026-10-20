import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ParseIdPipe } from '../../../shared/http/pipes/parse-id.pipe';
import { ListClubTransactionsUseCase } from '../application/list-club-transactions.use-case';
import { TransactionFilter } from '../application/transaction.repository';
import { TransactionFilterQueryPipe } from './transaction-filter-query.pipe';
import { toTransactionHistoryResponse, TransactionHistoryResponse } from './transaction.response';
import { toTransactionsCsv } from './transactions-csv';

const CSV_CONTENT_TYPE = 'text/csv';

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

  /** RN18: mesmos filtros e ordem do histórico; o tipo CSV só vale para a resposta de sucesso. */
  @Get(':id/transactions/export')
  async export(
    @Param('id', ParseIdPipe) clubId: number,
    @Query(TransactionFilterQueryPipe) filter: TransactionFilter,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const { data } = await this.listClubTransactions.execute(clubId, filter);
    response.type(CSV_CONTENT_TYPE);
    return toTransactionsCsv(data);
  }
}
