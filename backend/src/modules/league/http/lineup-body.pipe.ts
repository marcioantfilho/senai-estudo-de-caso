import { Injectable, PipeTransform } from '@nestjs/common';
import { JsonObject } from '../../../shared/http/pipes/json-object-body.pipe';
import { readDistinctIntegerList, readEnum } from '../../../shared/http/validation/body-fields';
import { ID_RANGE } from '../../../shared/http/validation/query-params';
import { LineupOrder } from '../application/set-lineup.use-case';
import { FORMATIONS, LINEUP_SIZE } from '../domain/lineup';

/** `PUT /clubs/{id}/lineup`: formação da lista e exatamente 5 ids distintos e positivos, em qualquer ordem. */
@Injectable()
export class LineupBodyPipe implements PipeTransform<JsonObject, LineupOrder> {
  transform(body: JsonObject): LineupOrder {
    return {
      formation: readEnum(body, 'formation', FORMATIONS),
      playerIds: readDistinctIntegerList(body, 'player_ids', LINEUP_SIZE, ID_RANGE),
    };
  }
}
