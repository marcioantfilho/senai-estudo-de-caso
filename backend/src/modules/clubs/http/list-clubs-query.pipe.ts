import { Injectable, PipeTransform } from '@nestjs/common';
import { QueryParams, readQueryEnum } from '../../../shared/http/validation/query-params';
import { CLUB_SORT_OPTIONS, ClubSortOption, DEFAULT_CLUB_SORT } from '../domain/club-sort';

/** `GET /clubs`: `sort` com um só valor. */
@Injectable()
export class ListClubsQueryPipe implements PipeTransform<QueryParams, ClubSortOption> {
  transform(query: QueryParams): ClubSortOption {
    return readQueryEnum(query, 'sort', CLUB_SORT_OPTIONS) ?? DEFAULT_CLUB_SORT;
  }
}
