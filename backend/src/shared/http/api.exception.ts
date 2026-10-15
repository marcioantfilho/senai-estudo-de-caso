import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Recusa criada pela própria aplicação. Só a mensagem destas exceções chega ao
 * cliente; as do framework recebem uma mensagem padrão no filtro central.
 */
export abstract class ApiException extends HttpException {
  protected constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}

/** V9: dado, formato ou parâmetro inválido. */
export class InvalidRequestException extends ApiException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/** V8 e V9: recurso inexistente, inclusive id da URL fora do formato. */
export class ResourceNotFoundException extends ApiException {
  constructor(message = 'Recurso não encontrado.') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

/** V9: regra de negócio violada. */
export class BusinessRuleException extends ApiException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}
