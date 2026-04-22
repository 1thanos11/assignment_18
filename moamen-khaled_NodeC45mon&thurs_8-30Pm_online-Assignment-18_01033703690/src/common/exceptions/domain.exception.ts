import { ApplicationException } from "./application.exception.js";

//not found exception
export class NotFoundException extends ApplicationException {
  constructor(message: string = "not found", cause?: unknown) {
    super(message, 404, { cause });
  }
}

//bad request exception
export class BadRequestException extends ApplicationException {
  constructor(message: string = "bad request", cause?: unknown) {
    super(message, 400, { cause });
  }
}

//conflict exception
export class ConflictException extends ApplicationException {
  constructor(message: string = "conflict data", cause?: unknown) {
    super(message, 409, { cause });
  }
}

//Unauthorized exception
export class UnauthorizedException extends ApplicationException {
  constructor(message: string = "Unauthorized", cause?: unknown) {
    super(message, 401, { cause });
  }
}

//Forbidden
export class ForbiddenException extends ApplicationException {
  constructor(message: string = "Forbidden", cause?: unknown) {
    super(message, 403, { cause });
  }
}
