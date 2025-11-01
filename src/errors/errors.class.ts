import { z } from "zod";
import { AppError } from "./app-error.class";

export class BadRequestError extends AppError {
  constructor(message = "Bad request", opts = {}) {
    super(message, {
      title: "Bad Request",
      level: "warn",
      statusCode: 400,
      type: "urn:problem:bad-request",
      ...opts,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", opts = {}) {
    super(message, {
      title: "Unauthorized",
      level: "warn",
      statusCode: 401,
      type: "urn:problem:unauthorized",
      ...opts,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", opts = {}) {
    super(message, {
      title: "Not found",
      level: "warn",
      statusCode: 404,
      type: "urn:problem:not-found",
      ...opts,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", opts = {}) {
    super(message, {
      title: "Conflict",
      level: "warn",
      statusCode: 409,
      type: "urn:problem:conflict",
      ...opts,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied", opts = {}) {
    super(message, {
      title: "Access denied",
      level: "warn",
      statusCode: 403,
      type: "urn:problem:access-denied",
      ...opts,
    });
  }
}

export class ZodValidationError extends AppError {
  constructor(
    zodError: z.ZodError,
    source: "body" | "query" | "params" | "headers",
    message = "Validation failed",
    opts = {},
  ) {
    const flattened = z.flattenError(zodError); // { fieldErrors, formErrors }
    // Выбираем одно ключевое сообщение для human-readable `detail`
    const primaryDetail =
      flattened.formErrors?.[0] ??
      Object.values(flattened.fieldErrors ?? {})
        .flat()
        .find((msg): msg is string => !!msg) ??
      message;

    super(message, {
      title: "Validation failed",
      level: "warn",
      statusCode: 422,
      detail: primaryDetail,
      // Храним ВСЮ структуру + источник (body|query|params|headers)
      details: { source, ...flattened },
      // (опц.) code: "VALIDATION_ERROR"
      type: "urn:problem:validation-error",
      ...opts,
    });
  }
}
