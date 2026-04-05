export class DomainException extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(
    message: string,
    statusCode: number = 400,
    code: string = 'DOMAIN_ERROR',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class BadRequestDomainException extends DomainException {
  constructor(message: string = 'Bad Request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class UnauthorizedDomainException extends DomainException {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenDomainException extends DomainException {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundDomainException extends DomainException {
  constructor(message: string = 'Not Found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictDomainException extends DomainException {
  constructor(message: string = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}
