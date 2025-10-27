// src/middleware/error-handler.middleware.js
import { AppError } from "../errors/errors.class";
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

// TODO: Вернуть логирование через Winsonon и sanitize body

function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Если заголовки уже отправлены — отдаем управление встроенному обработчику Express
  if (res.headersSent) return next(err);

  // Известные (операционные) ошибки нашего приложения → RFC 7807
  if (err instanceof AppError) {
    const problem = {
      title: err.title, // краткий заголовок
      detail: err.detail, // одно ключевое сообщение (может быть undefined)
      status: err.statusCode, // HTTP статус
      type: err.type || "about:blank",
      instance: req.originalUrl, // путь запроса
      // RFC 7807 extensions — любые доп. поля верхнего уровня
      ...(err.details && { errors: err.details }), // напр. zod.flatten() + { source }
    };

    res.type("application/problem+json");
    return res.status(err.statusCode).json(problem);
  }

  const normalizedError = normalizeUnknownError(err);

  const problem = {
    title: normalizedError.name,
    detail:
      NODE_ENV !== "production"
        ? normalizedError.message
        : "Internal Server Error",
    status: 500,
    type: "about:blank",
    instance: req.originalUrl,
    ...(NODE_ENV !== "production" ? { stack: normalizedError.stack } : {}),
  };

  res.type("application/problem+json");
  return res.status(500).json(problem);
}

export default errorHandler;
