import { Injectable, PipeTransform } from '@nestjs/common';
import { JsonObject } from '../../../shared/http/pipes/json-object-body.pipe';
import { readInteger } from '../../../shared/http/validation/body-fields';
import { ID_RANGE } from '../../../shared/http/validation/query-params';
import { rejectInvalid } from '../../../shared/http/validation/rules';
import { MatchOrder } from '../application/play-match.use-case';

/** `POST /matches`: ids positivos (0 ou negativo → 400) e mandante diferente do visitante (400). */
@Injectable()
export class MatchBodyPipe implements PipeTransform<JsonObject, MatchOrder> {
  transform(body: JsonObject): MatchOrder {
    const homeClubId = readInteger(body, 'home_club_id', ID_RANGE);
    const awayClubId = readInteger(body, 'away_club_id', ID_RANGE);
    if (homeClubId === awayClubId) {
      rejectInvalid('O mandante e o visitante devem ser clubes diferentes.');
    }
    return { homeClubId, awayClubId };
  }
}
