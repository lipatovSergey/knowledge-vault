import { NextFunction, Request, Response } from "express";
import { ConflictError } from "../errors/errors.class";

function requireGuest(req: Request, _res: Response, next: NextFunction) {
  if (req.session.userId) {
    throw new ConflictError();
  }
  next();
}

export default requireGuest;
