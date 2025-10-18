// @ts-check
const z = require("zod");
const AppError = require("./app-error.class");

class BadRequestError extends AppError {
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

class UnauthorizedError extends AppError {
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

class NotFoundError extends AppError {
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

class ConflictError extends AppError {
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

class ForbiddenError extends AppError {
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

const ALLOWED_SOURCES = ["body", "query", "params", "headers"];

class ZodValidationError extends AppError {
  /**
   * @param {import("zod").ZodError} zodError ZOD validation error object.
   * @param {"body"|"query"|"params"|"headers"} source Part of request that contains field, that caused error.
   * @param {string} [message] Human-readable fallback message;
   * @param {object} [opts] Optional error fields.
   */
  constructor(zodError, source, message = "Validation failed", opts = {}) {
    if (!ALLOWED_SOURCES.includes(source)) {
      throw new RangeError(`Unsupported validation source: ${source}`);
    }
    const flattened = z.flattenError(zodError); // { fieldErrors, formErrors }
    // Выбираем одно ключевое сообщение для human-readable `detail`
    const primaryDetail =
      flattened.formErrors?.[0] ||
      Object.values(flattened.fieldErrors || {}).flat()[0] ||
      "Validation failed";

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

module.exports = {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ZodValidationError,
  ForbiddenError,
  AppError,
};
