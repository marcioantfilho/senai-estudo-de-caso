import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from './api.exception';

const CLIENT_ERROR_MESSAGE = 'Requisição inválida.';
const SERVER_ERROR_MESSAGE = 'Erro interno do servidor.';

const DEFAULT_MESSAGES: Readonly<Partial<Record<number, string>>> = {
  [HttpStatus.NOT_FOUND]: 'Recurso não encontrado.',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'O corpo da requisição é grande demais.',
};

/**
 * Tratamento central de erros: toda recusa responde um objeto JSON com
 * `message`, sem stack trace nem mensagens internas do framework.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    const message = exception instanceof ApiException ? exception.message : defaultMessage(status);
    response.status(status).json({ message });
  }
}

function defaultMessage(status: number): string {
  const fallback = status < HttpStatus.INTERNAL_SERVER_ERROR ? CLIENT_ERROR_MESSAGE : SERVER_ERROR_MESSAGE;
  return DEFAULT_MESSAGES[status] ?? fallback;
}
