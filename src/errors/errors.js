const AppError = require("./AppError");

class BadRequesError extends AppError {
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
		super(message, 401, "warn");
	}
}

class ZodValidationError extends AppError {
	constructor(zodError) {
		super("Validation Failed", 400);
		this.details = zodError.flatten().fieldErrors;
	}
}

module.exports = {
	BadRequesError,
	UnauthorizedError,
	NotFoundError,
	ConflictError,
	ZodValidationError,
	AppError,
};
