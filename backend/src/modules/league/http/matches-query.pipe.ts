import { Injectable, PipeTransform } from '@nestjs/common';
import { ID_RANGE, QueryParams, readQueryInteger } from '../../../shared/http/validation/query-params';

/** `GET /matches`: `club_id` opcional, inteiro positivo no formato dos query params. */
@Injectable()
export class MatchesQueryPipe implements PipeTransform<QueryParams, number | undefined> {
  transform(query: QueryParams): number | undefined {
    return readQueryInteger(query, 'club_id', ID_RANGE);
  }
}
