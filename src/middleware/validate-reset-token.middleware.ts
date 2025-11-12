import { BadRequestError } from "../errors/errors.class";
import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { PasswordResetToken } from "../types/primitives";

function validateResetToken(schema: ZodType<{ token: PasswordResetToken }>): RequestHandler {
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
