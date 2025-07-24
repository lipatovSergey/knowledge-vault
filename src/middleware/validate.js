function validate(schema) {
	return (req, res, next) => {
		const result = schema.safeParse(req.body);
		if (!result.success) {
			const error = result.error.flatten().fieldErrors;
			return res.status(400).json({ errors: error });
		}
		req.validatedData = result.data;
		next();
	};
}

module.exports = validate;
