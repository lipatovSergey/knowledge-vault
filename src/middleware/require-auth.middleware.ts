import { UnauthorizedError } from "../errors/errors.class";
import { Request, Response, NextFunction } from "express";

function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session.userId) {
    throw new UnauthorizedError();
  }
  next();
}

export default requireAuth;
