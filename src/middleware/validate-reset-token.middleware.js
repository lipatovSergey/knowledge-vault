const { BadRequestError } = require("../errors/errors.class.js");

function validateResetToken(schema) {
	return (req, res, next) => {
		const result = schema.safeParse(req.body);
		if (!result.success) {
			return next(new BadRequestError("Invalid or expired token"));
		}
		// Merge validated data with any existing validated data from previous middleware
		req.validatedResetToken = result.data.token;
		next();
	};
}

module.exports = validateResetToken;
