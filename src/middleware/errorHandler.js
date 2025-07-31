const { AppError } = require("../errors/errors");
const logger = require("../config/logger");
const sanitizeBody = require("../utils/sanitizeBody");
const { NODE_ENV } = require("../config/env");

function errorHandler(err, req, res, next) {
	// important! If error happened after the res was send, we delegate it to build in express error handler. It stops the session.
	if (res.headersSend) {
		return next(err);
	}
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
		message:
			NODE_ENV !== "production"
				? "Error unknown by custom error handler"
				: "Internal Server Error",
		...(NODE_ENV !== "production" && { stack: err.stack }),
	});
}

module.exports = errorHandler;
