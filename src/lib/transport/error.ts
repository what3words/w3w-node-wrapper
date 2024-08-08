import type { TransportResponse } from './model';

export class TransportError<T> extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: T
  ) {
    super(message);
  }
}
export class BadRequestError<T> extends TransportError<T> {
  constructor(message?: string, details?: T) {
    super(message || 'Bad Request', 400, details);
  }
}
export class UnauthorizedError<T> extends TransportError<T> {
  constructor(message?: string, details?: T) {
    super(message || 'Unauthorized', 401, details);
  }
}

export class PaymentRequiredError<T> extends TransportError<T> {
  constructor(message?: string, details?: T) {
    super(message || 'Payment Required', 402, details);
  }
}

export class ForbiddenError<T> extends TransportError<T> {
  constructor(message?: string, details?: T) {
    super(message || 'Forbidden', 403, details);
  }
}
export class NotFoundError<T> extends TransportError<T> {
  constructor(message?: string, details?: T) {
    super(message || 'Not Found', 404, details);
  }
}
export class InternalServerError<T> extends TransportError<T> {
  constructor(message?: string, details?: T) {
    super(message || 'Internal Server Error', 500, details);
  }
}
export class BadGatewayError<T> extends TransportError<T> {
  constructor(message?: string, details?: T) {
    super(message || 'Bad Gateway', 502, details);
  }
}
export class ServiceUnavailableError<T> extends TransportError<T> {
  constructor(message?: string, details?: T) {
    super(message || 'Service Unavailable', 503, details);
  }
}
export class GatewayTimeoutError<T> extends TransportError<T> {
  constructor(message?: string, details?: T) {
    super(message || 'Gateway Timeout', 504, details);
  }
}

export function errorHandler<T>(
  response: TransportResponse<T>
): TransportResponse<T> {
  if (!response) return { status: 204, statusText: 'No Content' };
  const { status, statusText: message, body } = response;
  const details =
    body && typeof body === 'object' && 'error' in body ? body.error : body;
  if (status >= 400)
    switch (status) {
      case 400:
        throw new BadRequestError(message, details);
      case 401:
        throw new UnauthorizedError(message, details);
      case 402:
        throw new PaymentRequiredError(message, details);
      case 403:
        throw new ForbiddenError(message, details);
      case 404:
        throw new NotFoundError(message, details);
      case 500:
        throw new InternalServerError(message, details);
      case 502:
        throw new BadGatewayError(message, details);
      case 503:
        throw new ServiceUnavailableError(message, details);
      case 504:
        throw new GatewayTimeoutError(message, details);
      default:
        throw new TransportError(message || 'Transport Error', status, details);
    }
  return response;
}
