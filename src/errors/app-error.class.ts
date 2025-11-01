// @ts-check
//
export type AppErrorLevel = "warn" | "error" | "info";

export type AppErrorOptions = {
  title: string;
  statusCode: number;
  type: string;
  detail?: string;
  level?: AppErrorLevel;
  details?: unknown;
};

export abstract class AppError extends Error {
  public readonly title: string;
  public readonly statusCode: number;
  public readonly type: string;
  public readonly detail: string;
  public readonly level: AppErrorLevel;
  public readonly details?: unknown;

  protected constructor(message = "Unexpected error", opts: AppErrorOptions) {
    super(message);
    this.title = opts.title;
    this.statusCode = opts.statusCode;
    this.type = opts.type; // напр. "urn:problem:validation-error"
    this.detail = opts.detail ?? message; // одно ключевое сообщение для человека
    this.level = opts.level ?? "warn";
    this.name = new.target.name;
    // RFC 7807 fields (опционально, но полезно)
    // Машинные детали (например, zod.flatten())
    this.details = opts.details; // { fieldErrors, formErrors } или иное
    Error.captureStackTrace?.(this, new.target);
  }
}
