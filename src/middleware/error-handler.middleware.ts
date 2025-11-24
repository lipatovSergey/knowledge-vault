// src/middleware/error-handler.middleware
import { AppError } from "../errors/app-error.class";
import type { Request, Response, NextFunction } from "express";
const NODE_ENV = process.env.NODE_ENV;

const normalizeUnknownError = (err: unknown): Error => {
  if (err instanceof Error) return err;
  if (typeof err === "string") return new Error(err);
  // Fallback if JSON.stringify will fall for some reason
  const serialized = (() => {
    try {
      return JSON.stringify(err);
    } catch {
      return "[unserializable error]";
    }
  })();

  return new Error(serialized || "Unexpected Error");
};

function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // If headers were send (exm. error happened when response was send partly) - give a control to build in Express error handler
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    const problem = {
      title: err.title,
      detail: err.detail,
      status: err.statusCode,
      type: err.type || "about:blank",
      instance: req.originalUrl,
      ...(err.details && typeof err.details === "object" ? { errors: err.details } : {}), // exm. zod.flatten() + { source }
    };

    res.type("application/problem+json");
    return res.status(err.statusCode).json(problem);
  }

  const normalizedError = normalizeUnknownError(err);

  const problem = {
    title: normalizedError.name,
    detail: NODE_ENV !== "production" ? normalizedError.message : "Internal Server Error",
    status: 500,
    type: "about:blank",
    instance: req.originalUrl,
    ...(NODE_ENV !== "production" ? { stack: normalizedError.stack } : {}),
  };

  res.type("application/problem+json");
  return res.status(500).json(problem);
}

export default errorHandler;
