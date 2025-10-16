// src/middleware/error-handler.middleware.js
const { AppError } = require("../errors/errors.class");
const logger = require("../config/logger");
const sanitizeBody = require("../utils/sanitize-body.util");
const { NODE_ENV } = require("../config/env");

function errorHandler(err, req, res, next) {
  // Если заголовки уже отправлены — отдаем управление встроенному обработчику Express
  if (res.headersSent) return next(err);

  const level = err instanceof AppError ? err.level : "error";

  // Логируем всегда
  logger[level](err.message, {
    name: err.name,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    path: req.originalUrl,
    method: req.method,
    body: sanitizeBody(req.body),
  });

  // Известные (операционные) ошибки нашего приложения → RFC 7807
  if (err instanceof AppError) {
    const problem = {
      type: err.type || "about:blank",
      title: err.title, // краткий заголовок
      status: err.statusCode, // HTTP статус
      detail: err.detail, // одно ключевое сообщение (может быть undefined)
      instance: req.originalUrl, // путь запроса
      // RFC 7807 extensions — любые доп. поля верхнего уровня
      ...(err.code && { code: err.code }),
      ...(err.details && { errors: err.details }), // напр. zod.flatten() + { source }
    };

    res.type("application/problem+json");
    return res.status(err.statusCode).json(problem);
  }

  // Неизвестные/необработанные ошибки → 500 в формате RFC 7807
  const problem500 = {
    type: "about:blank",
    title:
      NODE_ENV !== "production"
        ? "Error unknown by custom error handler"
        : "Internal Server Error",
    status: 500,
    instance: req.originalUrl,
    ...(NODE_ENV !== "production" && { stack: err.stack }),
  };

  res.type("application/problem+json");
  return res.status(500).json(problem500);
}

module.exports = errorHandler;
