import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import type { RequestWithValidatedBody } from "../types/validated-request";

import { ZodValidationError } from "../errors/errors.class";

function validateBody<Body>(schema: ZodType<Body>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ZodValidationError(result.error, "body"));
    }
    // Merge validated data with any existing validated data from previous middleware
    const typedReq = req as RequestWithValidatedBody<Body>;
    typedReq.validatedBody = {
      ...(typedReq.validatedBody || {}),
      ...result.data,
    };
    next();
  };
}

export default validateBody;
