const { ZodValidationError } = require("../errors/errors.class");

// validates request's params, write validated data to req.validatedParams
function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(new ZodValidationError(result.error, "params"));
    }

    req.validatedParams = {
      ...(req.validatedParams || {}),
      ...result.data,
    };
    next();
  };
}

module.exports = validateParams;
