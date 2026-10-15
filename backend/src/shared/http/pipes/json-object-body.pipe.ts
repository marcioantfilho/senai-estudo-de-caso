import { Injectable, PipeTransform } from '@nestjs/common';
import { InvalidRequestException } from '../api.exception';

export type JsonObject = Record<string, unknown>;

const INVALID_JSON_MESSAGE = 'O corpo da requisição não é um JSON válido.';
const NOT_AN_OBJECT_MESSAGE = 'O corpo da requisição deve ser um objeto JSON.';

@Injectable()
export class JsonObjectBodyPipe implements PipeTransform<unknown, JsonObject> {
  transform(rawBody: unknown): JsonObject {
    if (typeof rawBody !== 'string' || rawBody.length === 0) {
      throw new InvalidRequestException(NOT_AN_OBJECT_MESSAGE);
    }

    const parsed = parseJson(rawBody);
    if (!isJsonObject(parsed)) {
      throw new InvalidRequestException(NOT_AN_OBJECT_MESSAGE);
    }

    return parsed;
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new InvalidRequestException(INVALID_JSON_MESSAGE);
  }
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
