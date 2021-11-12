import type { TransportResponse } from './model';

export class TransportError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}
export class BadRequestError extends TransportError {
  constructor(message?: string) {
    super(message || 'Bad Request', 400);
  }
}
export class UnauthorizedError extends TransportError {
  constructor(message?: string) {
    super(message || 'Unauthorized', 401);
  }
}
export class ForbiddenError extends TransportError {
  constructor(message?: string) {
    super(message || 'Forbidden', 403);
  }
}
export class NotFoundError extends TransportError {
  constructor(message?: string) {
    super(message || 'Not Found', 404);
  }
}
export class InternalServerError extends TransportError {
  constructor(message?: string) {
    super(message || 'Internal Server Error', 500);
  }
}
export class BadGatewayError extends TransportError {
  constructor(message?: string) {
    super(message || 'Bad Gateway', 502);
  }
}
export class ServiceUnavailableError extends TransportError {
  constructor(message?: string) {
    super(message || 'Service Unavailable', 503);
  }
}
export class GatewayTimeoutError extends TransportError {
  constructor(message?: string) {
    super(message || 'Gateway Timeout', 504);
  }
}

export function errorHandler<T>(
  response: TransportResponse<T>
): TransportResponse<T> {
  if (!response) return { status: 204, statusText: 'No Content' };
  const { status, statusText: message } = response;
  if (status >= 400)
    switch (status) {
      case 400:
        throw new BadRequestError(message);
      case 401:
        throw new UnauthorizedError(message);
      case 403:
        throw new ForbiddenError(message);
      case 404:
        throw new NotFoundError(message);
      case 500:
        throw new InternalServerError(message);
      case 502:
        throw new BadGatewayError(message);
      case 503:
        throw new ServiceUnavailableError(message);
      case 504:
        throw new GatewayTimeoutError(message);
      default:
        throw new TransportError(message || 'Transport Error', status);
    }
  return response;
}
