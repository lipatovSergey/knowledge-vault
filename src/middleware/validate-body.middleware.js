const { ZodValidationError } = require("../errors/errors.class");

function validateBody(schema) {
	return (req, res, next) => {
		const result = schema.safeParse(req.body);
		if (!result.success) {
			return next(new ZodValidationError(result.error));
		}
		// Merge validated data with any existing validated data from previous middleware
		req.validatedBody = {
			...(req.validatedBody || {}),
			...result.data,
		};
		next();
	};
}

module.exports = validateBody;
