const { AppError } = require("../errors/errors");

function errorHandler(err, req, res, next) {
	// always send to logger
	console.error("Error: ", err);

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
