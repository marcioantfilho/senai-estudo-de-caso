import { Injectable, PipeTransform } from '@nestjs/common';
import { JsonObject } from '../../../shared/http/pipes/json-object-body.pipe';
import { readString, readText } from '../../../shared/http/validation/body-fields';
import { isWithin, rejectInvalid } from '../../../shared/http/validation/rules';
import { countWords } from '../../../shared/http/validation/text-normalization';
import { ClubRegistration } from '../domain/club';
import {
  CLUB_NAME_LENGTH,
  CLUB_NAME_WORDS,
  hasValidAcronymFormat,
  hasValidClubNameCharacters,
  isAcronymOfName,
} from '../domain/club-limits';

/** `POST /clubs`: `name` e `acronym` ("Limites de cada campo"). */
@Injectable()
export class CreateClubBodyPipe implements PipeTransform<JsonObject, ClubRegistration> {
  transform(body: JsonObject): ClubRegistration {
    const name = readClubName(body);
    const acronym = readString(body, 'acronym');

    if (!hasValidAcronymFormat(acronym)) {
      rejectInvalid('O campo acronym deve ter 3 letras de A a Z, maiúsculas, sem acento e não todas iguais.');
    }
    if (!isAcronymOfName(acronym, name)) {
      rejectInvalid(
        'As letras do campo acronym devem aparecer no nome nessa ordem, começando pela primeira letra do nome.',
      );
    }
    return { name, acronym };
  }
}

function readClubName(body: JsonObject): string {
  const name = readText(body, 'name', CLUB_NAME_LENGTH);
  if (!isWithin(countWords(name), CLUB_NAME_WORDS)) {
    rejectInvalid('O campo name deve ter de 2 a 5 palavras.');
  }
  if (!hasValidClubNameCharacters(name)) {
    rejectInvalid('O campo name aceita só letras, espaços, hífen e ponto.');
  }
  return name;
}
