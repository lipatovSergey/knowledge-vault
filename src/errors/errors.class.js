const AppError = require("./app-error.class");

class BadRequestError extends AppError {
	constructor(message = "Bad Request") {
		super(message, 400, "warn");
	}
}

class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized") {
		super(message, 401, "warn");
	}
}
class NotFoundError extends AppError {
	constructor(message = "Not Found") {
		super(message, 404, "warn");
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
	constructor(zodError) {
		super("Validation Failed", 400, "warn");
		this.details = zodError.flatten().fieldErrors;
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
