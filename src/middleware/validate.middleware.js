const { ZodValidationError } = require("../errors/errors.class");

function validate(schema) {
	return (req, res, next) => {
		const result = schema.safeParse(req.body);
		if (!result.success) {
			return next(new ZodValidationError(result.error));
		}
		req.validatedData = result.data;
		next();
	};
}

module.exports = validate;
