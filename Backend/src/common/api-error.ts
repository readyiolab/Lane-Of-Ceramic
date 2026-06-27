/** Standardised API error with status code, error code, and operational flag. */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: unknown,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory methods ───────────────────────────────────────────

  static badRequest(message = "Bad Request", details?: unknown) {
    return new AppError(message, 400, "BAD_REQUEST", details);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static notFound(resource = "Resource") {
    return new AppError(`${resource} not found`, 404, "NOT_FOUND");
  }

  static conflict(message = "Conflict") {
    return new AppError(message, 409, "CONFLICT");
  }

  static tooManyRequests(message = "Too many requests, try again later") {
    return new AppError(message, 429, "RATE_LIMITED");
  }

  static internal(message = "Internal server error") {
    return new AppError(message, 500, "INTERNAL_ERROR", undefined, false);
  }

  static validation(errors: unknown) {
    return new AppError("Validation failed", 400, "VALIDATION_ERROR", errors);
  }

  static insufficientStock(productName?: string) {
    const msg = productName
      ? `Insufficient stock for "${productName}"`
      : "Insufficient stock";
    return new AppError(msg, 409, "INSUFFICIENT_STOCK");
  }

  static paymentFailed(message = "Payment processing failed") {
    return new AppError(message, 402, "PAYMENT_FAILED");
  }
}
