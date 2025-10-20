const { BadRequestError } = require("../errors/errors.class");

// validates request's params, write validated data to req.validatedParams
function validateParams(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(
        new BadRequestError(result.error.issues[0].message, "params"),
      );
    }

    req.validatedParams = {
      ...(req.validatedParams || {}),
      ...result.data,
    };
    next();
  };
}

module.exports = validateParams;
