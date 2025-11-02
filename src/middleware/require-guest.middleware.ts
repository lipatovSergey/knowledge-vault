import { ConflictError } from "../errors/errors.class";
import { Request, Response, NextFunction } from "express";

function requireGuest(req: Request, _res: Response, next: NextFunction) {
  if (req.session.userId) {
    throw new ConflictError();
  }
  next();
}

export default requireGuest;
