import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import type { RequestWithValidatedParams } from "../types/validated-request";
import type { ParamsDictionary } from "express-serve-static-core";
import { BadRequestError } from "../errors/errors.class";

// validates request's params, write validated data to req.validatedParams
function validateParams<Params extends ParamsDictionary>(
  schema: ZodType<Params>,
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(
        new BadRequestError(result.error.issues[0].message, "params"),
      );
    }

    const typedReq = req as RequestWithValidatedParams<Params>;
    typedReq.validatedParams = {
      ...(typedReq.validatedParams || {}),
      ...result.data,
    };
    next();
  };
}

export default validateParams;
