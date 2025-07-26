const { AppError, ZodValidationError } = require("../errors/errors");
const logger = require("../config/logger");
const sanitizeBody = require("../utils/sanitizeBody");

function errorHandler(err, req, res, next) {
	const level = err instanceof AppError ? err.level : "error";
	// always send to logger
	logger[level](err.message, {
		name: err.name,
		stack: err.stack,
		statusCode: err.statusCode || 500,
		path: req.originalUrl,
		method: req.method,
		body: sanitizeBody(req.body),
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
