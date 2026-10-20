import { Injectable, PipeTransform } from '@nestjs/common';
import {
  ID_RANGE,
  QueryParams,
  readQueryEnumList,
  readQueryInteger,
} from '../../../shared/http/validation/query-params';
import { TransactionFilter } from '../application/transaction.repository';
import { TRANSACTION_TYPES } from '../domain/transaction';

/** `type`: um ou mais de COMPRA e VENDA, por vírgula, sem espaços e sem repetição; `player_id`: inteiro positivo. */
@Injectable()
export class TransactionFilterQueryPipe implements PipeTransform<QueryParams, TransactionFilter> {
  transform(query: QueryParams): TransactionFilter {
    return {
      types: readQueryEnumList(query, 'type', TRANSACTION_TYPES),
      playerId: readQueryInteger(query, 'player_id', ID_RANGE),
    };
  }
}
