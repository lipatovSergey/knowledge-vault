import { BadRequestError } from "../errors/errors.class";
import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import type { RequestWithValidatedQuery } from "../types/validated-request";

function validateQuery<Query>(schema: ZodType<Query>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new BadRequestError(result.error.issues[0].message, "query"));
    }

    const typedRequest = req as RequestWithValidatedQuery<Query>;
    typedRequest.validatedQuery = {
      ...(typedRequest.validatedQuery || {}),
      ...result.data,
    };
    next();
  };
}

export default validateQuery;
