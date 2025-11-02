import { BadRequestError } from "../errors/errors.class.js";
import type { RequestHandler } from "express";
import type { ZodType } from "zod";

function validateResetToken(
  schema: ZodType<{ token: string }>,
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new BadRequestError("Invalid or expired token"));
    }
    // Merge validated data with any existing validated data from previous middleware
    req.validatedResetToken = result.data.token;
    next();
  };
}

export default validateResetToken;
