const { AppError, ZodValidationError } = require("../errors/errors");
const logger = require("../config/logger");

function errorHandler(err, req, res, next) {
	if (err instanceof ZodValidationError) {
		logger.warn("Validation failed", {
			path: req.originalUrl,
			method: req.method,
			errors: err.details,
		});
		return res.status(err.statusCode).json({
			message: err.message,
			errors: err.details,
		});
	}
	// always send to logger
	logger.error(err.message, {
		name: err.name,
		stack: err.stack,
		statusCode: err.statusCode || 500,
		path: req.originalUrl,
		method: req.method,
		body: req.body,
	});
	// operational errors
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			message: err.message,
			...(err.details && { errors: err.details }),
		});
	}

	// unknown errors
	return res.status(500).json({
		message: "Internal Server Error",
	});
}

module.exports = errorHandler;
