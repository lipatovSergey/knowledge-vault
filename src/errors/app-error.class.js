// @ts-check

/**
 * Base application error that formats responses according to RFC 7807.
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */
class AppError extends Error {
  /**
   * @param  {string} [message="Unexpected error"] Human readable message, used in Error.message and in `detail` as default.
   * @param {object} [opts] Optional error fields.
   * @param {string} [opts.title=message] Short header (`title`).
   * @param {string} [opts.detail=message] Description (`detail`). Falls back to `message` when omitted.
   * @param {number} [opts.statusCode=500] HTTP status for client
   * @param {string} [opts.level="warn"] Logger level (warn|error|info)
   * @param {string} [opts.type="about:blank"] Identifier of error type from RFC 7807. Falls back to "about:blank".
   * @param {object|undefined} [opts.details] Additional diagnostic data (e.g. result of zodError.flatten()).
   */

  constructor(message = "Unexpected error", opts = {}) {
    const {
      title = message,
      detail = message,
      statusCode = 500,
      level = "warn",
      type = "about:blank",
      details,
    } = opts;

    super(message);
    this.title = title;
    this.statusCode = statusCode;
    this.level = level;
    this.name = this.constructor.name;
    // RFC 7807 fields (опционально, но полезно)
    this.type = type; // напр. "urn:problem:validation-error"
    this.detail = detail; // одно ключевое сообщение для человека
    // Машинные детали (например, zod.flatten())
    this.details = details; // { fieldErrors, formErrors } или иное
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
