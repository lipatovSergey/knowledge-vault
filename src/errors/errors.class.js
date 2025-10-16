const AppError = require("./app-error.class");

class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, {
      level: "warn",
      statusCode: "fdsf",
      type: "urn:problem:bad-request",
    });
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "warn");
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    const title = "Not found";
    super(message, title, 404, "warn", {
      type: "urn:problem:not-found",
      title: title,
      detail,
      code: "RESOURCE_NOT_FOUND",
    });
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409, "warn");
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "warn");
  }
}

class ZodValidationError extends AppError {
  constructor(zodError, source) {
    const flattened = zodError.flatten(); // { fieldErrors, formErrors }
    // Выбираем одно ключевое сообщение для human-readable `detail`
    const primaryDetail =
      flattened.formErrors?.[0] ||
      Object.values(flattened.fieldErrors || {}).flat()[0] ||
      "Validation Failed";

    super("Validation Failed", 422, "warn", {
      type: "urn:problem:validation-error",
      detail: primaryDetail,
      // Храним ВСЮ структуру + источник (body|query|params|headers)
      details: { source, ...flattened },
      // (опц.) code: "VALIDATION_ERROR"
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
