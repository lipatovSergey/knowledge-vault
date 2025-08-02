class AppError extends Error {
	constructor(message, statusCode = 500, level = "warn") {
		super(message);
		this.statusCode = statusCode;
		this.level = level;
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}
module.exports = AppError;
