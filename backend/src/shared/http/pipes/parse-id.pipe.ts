import { Injectable, PipeTransform } from '@nestjs/common';
import { ResourceNotFoundException } from '../api.exception';
import { MAX_ID, parsePositiveInteger } from '../validation/positive-integer';

/**
 * V8: id da URL que não é inteiro positivo só com dígitos, sem zeros à
 * esquerda (`abc`, `0`, `-1`, `1.5`, `01`), ou que passa de 2.147.483.647,
 * conta como recurso inexistente (404).
 */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = parsePositiveInteger(value);
    if (id === null || id > MAX_ID) {
      throw new ResourceNotFoundException();
    }
    return id;
  }
}
