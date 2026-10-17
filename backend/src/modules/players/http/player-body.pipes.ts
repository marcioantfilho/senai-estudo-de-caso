import { Injectable, PipeTransform } from '@nestjs/common';
import { JsonObject } from '../../../shared/http/pipes/json-object-body.pipe';
import { readEnum, readInteger, readText } from '../../../shared/http/validation/body-fields';
import { rejectInvalid } from '../../../shared/http/validation/rules';
import { countWords, hasDigit } from '../../../shared/http/validation/text-normalization';
import { PlayerAttributes } from '../domain/overall';
import { PHYSICAL_CONDITIONS, PhysicalCondition } from '../domain/physical-condition';
import { PlayerProfile, PlayerRegistration } from '../domain/player';
import {
  AGE_RANGE,
  AGILITY_RANGE,
  ATTRIBUTE_RANGE,
  isAgilityAllowedForAge,
  isAttributeSumAllowed,
  isPotentialAllowed,
  PLAYER_NAME_LENGTH,
  PLAYER_NAME_MIN_WORDS,
  POTENTIAL_RANGE,
} from '../domain/player-limits';
import { POSITIONS } from '../domain/position';

/** `POST /players`: os campos do perfil, os seis atributos e o potencial. */
@Injectable()
export class RegisterPlayerBodyPipe implements PipeTransform<JsonObject, PlayerRegistration> {
  transform(body: JsonObject): PlayerRegistration {
    const profile = readProfile(body);
    const attributes = readAttributes(body);
    const potential = readInteger(body, 'potential', POTENTIAL_RANGE);

    if (!isAttributeSumAllowed(attributes)) {
      rejectInvalid('A soma dos seis atributos não pode passar de 480.');
    }
    if (!isPotentialAllowed(potential, attributes, profile.age)) {
      rejectInvalid(
        'O campo potential deve ser maior ou igual ao maior atributo e, com 33 anos ou mais, igual a ele.',
      );
    }
    return { ...profile, attributes, potential };
  }
}

/** `PUT /players/{id}`: nome, posição, agilidade e idade, mesmo que só um mude (RN08). */
@Injectable()
export class UpdatePlayerBodyPipe implements PipeTransform<JsonObject, PlayerProfile> {
  transform(body: JsonObject): PlayerProfile {
    return readProfile(body);
  }
}

@Injectable()
export class ChangeConditionBodyPipe implements PipeTransform<JsonObject, PhysicalCondition> {
  transform(body: JsonObject): PhysicalCondition {
    return readEnum(body, 'condition', PHYSICAL_CONDITIONS);
  }
}

function readProfile(body: JsonObject): PlayerProfile {
  const name = readPlayerName(body);
  const position = readEnum(body, 'position', POSITIONS);
  const agility = readInteger(body, 'agility', AGILITY_RANGE);
  const age = readInteger(body, 'age', AGE_RANGE);

  if (!isAgilityAllowedForAge(agility, age)) {
    rejectInvalid('Com 35 anos ou mais, o campo agility deve ser no máximo 85.');
  }
  return { name, position, agility, age };
}

function readPlayerName(body: JsonObject): string {
  const name = readText(body, 'name', PLAYER_NAME_LENGTH);
  if (countWords(name) < PLAYER_NAME_MIN_WORDS || hasDigit(name)) {
    rejectInvalid('O campo name deve ter pelo menos duas palavras e nenhum dígito.');
  }
  return name;
}

function readAttributes(body: JsonObject): PlayerAttributes {
  return {
    pace: readInteger(body, 'pace', ATTRIBUTE_RANGE),
    shooting: readInteger(body, 'shooting', ATTRIBUTE_RANGE),
    passing: readInteger(body, 'passing', ATTRIBUTE_RANGE),
    dribbling: readInteger(body, 'dribbling', ATTRIBUTE_RANGE),
    defending: readInteger(body, 'defending', ATTRIBUTE_RANGE),
    physical: readInteger(body, 'physical', ATTRIBUTE_RANGE),
  };
}
