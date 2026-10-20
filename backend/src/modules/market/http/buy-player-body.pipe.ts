import { Injectable, PipeTransform } from '@nestjs/common';
import { JsonObject } from '../../../shared/http/pipes/json-object-body.pipe';
import { readDateTime, readInteger } from '../../../shared/http/validation/body-fields';
import { ID_RANGE } from '../../../shared/http/validation/query-params';
import { PurchaseOrder } from '../application/buy-player.use-case';

/** `POST /players/{id}/buy`: `club_id` (0 ou negativo → 400) e `loyalty_until` no formato da RN01. */
@Injectable()
export class BuyPlayerBodyPipe implements PipeTransform<JsonObject, PurchaseOrder> {
  transform(body: JsonObject): PurchaseOrder {
    return {
      clubId: readInteger(body, 'club_id', ID_RANGE),
      loyaltyUntil: readDateTime(body, 'loyalty_until'),
    };
  }
}
