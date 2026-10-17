import { Injectable, PipeTransform } from '@nestjs/common';
import { MAX_ID } from '../../../shared/http/validation/positive-integer';
import {
  ID_RANGE,
  QueryParams,
  readQueryBoolean,
  readQueryDecimal,
  readQueryEnum,
  readQueryEnumList,
  readQueryInteger,
  readQueryText,
} from '../../../shared/http/validation/query-params';
import { rejectInvalid } from '../../../shared/http/validation/rules';
import { PlayerListQuery } from '../application/list-players.use-case';
import { PHYSICAL_CONDITIONS } from '../domain/physical-condition';
import { AGE_RANGE } from '../domain/player-limits';
import {
  DEFAULT_PLAYER_SORT,
  MAX_PLAYER_SORT_CRITERIA,
  PLAYER_SORT_OPTIONS,
  PlayerSortOption,
  sortField,
} from '../domain/player-sort';
import { POSITIONS } from '../domain/position';

const SEARCH_LENGTH = { min: 2, max: 100 };
const VALUE_RANGE = { min: 0, max: 550 };
const PAGE_RANGE = { min: 1, max: MAX_ID };
const LIMIT_RANGE = { min: 1, max: 50 };
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

/** `GET /players`: query params de "1. Filtros e query params aceitos". */
@Injectable()
export class ListPlayersQueryPipe implements PipeTransform<QueryParams, PlayerListQuery> {
  transform(query: QueryParams): PlayerListQuery {
    const listQuery: PlayerListQuery = {
      search: readQueryText(query, 'search', SEARCH_LENGTH),
      position: readQueryEnum(query, 'position', POSITIONS),
      condition: readQueryEnum(query, 'condition', PHYSICAL_CONDITIONS),
      free: readQueryBoolean(query, 'free'),
      clubId: readQueryInteger(query, 'club_id', ID_RANGE),
      minAge: readQueryInteger(query, 'min_age', AGE_RANGE),
      maxAge: readQueryInteger(query, 'max_age', AGE_RANGE),
      minValue: readQueryDecimal(query, 'min_value', VALUE_RANGE),
      maxValue: readQueryDecimal(query, 'max_value', VALUE_RANGE),
      sort: readSort(query),
      page: readQueryInteger(query, 'page', PAGE_RANGE) ?? DEFAULT_PAGE,
      limit: readQueryInteger(query, 'limit', LIMIT_RANGE) ?? DEFAULT_LIMIT,
    };
    rejectContradictions(listQuery);
    return listQuery;
  }
}

/** Até dois critérios, sem repetir o campo (como em `value_asc,value_desc`). */
function readSort(query: QueryParams): readonly PlayerSortOption[] {
  const sort = readQueryEnumList(query, 'sort', PLAYER_SORT_OPTIONS);
  if (sort === undefined) {
    return DEFAULT_PLAYER_SORT;
  }

  const fields = new Set(sort.map(sortField));
  if (sort.length > MAX_PLAYER_SORT_CRITERIA || fields.size !== sort.length) {
    rejectInvalid('O parâmetro sort aceita até dois critérios, sem repetir o campo.');
  }
  return sort;
}

function rejectContradictions({ minAge, maxAge, minValue, maxValue, free, clubId }: PlayerListQuery): void {
  if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
    rejectInvalid('O parâmetro min_age não pode ser maior que max_age.');
  }
  if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
    rejectInvalid('O parâmetro min_value não pode ser maior que max_value.');
  }
  if (free === true && clubId !== undefined) {
    rejectInvalid('Os parâmetros free=true e club_id não podem ser combinados.');
  }
}
