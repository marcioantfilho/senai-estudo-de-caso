import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class ApiException extends HttpException {
  protected constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}

export class InvalidRequestException extends ApiException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
