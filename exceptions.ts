// src/error-handling/exceptions.ts
import { ErrorResponse } from './errorResponse';
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from './errorCodes';

export class ServiceException extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly errorResponse: ErrorResponse;

  constructor(message: string, statusCode: number, errorCode: ErrorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorResponse = { message, statusCode, errorCode };
  }
}

export class AuthenticationException extends ServiceException {
  constructor(message: string = 'Authentication failed') {
    super(message, HttpStatus.UNAUTHORIZED, ErrorCode.AUTHENTICATION_FAILED);
  }
}

export class AuthorizationException extends ServiceException {
  constructor(message: string = 'Unauthorized access') {
    super(message, HttpStatus.FORBIDDEN, ErrorCode.AUTHORIZATION_FAILED);
  }
}

export class ResourceNotFoundException extends ServiceException {
  constructor(message: string = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
  }
}

export classInvalidRequestException extends ServiceException {
  constructor(message: string = 'Invalid request') {
    super(message, HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST);
  }
}

export function errorHandler(error: any): ErrorResponse {
  if (error instanceof ServiceException) {
    return error.errorResponse;
  } else {
    // log unknown error
    console.error(error);
    return { message: 'Internal server error', statusCode: HttpStatus.INTERNAL_SERVER_ERROR, errorCode: ErrorCode.UNKNOWN_ERROR };
  }
}