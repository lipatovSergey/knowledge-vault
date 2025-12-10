import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/errors.class";

function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session.userId) {
    throw new UnauthorizedError();
  }
  next();
}

export default requireAuth;
