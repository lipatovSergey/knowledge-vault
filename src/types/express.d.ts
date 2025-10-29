import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    validatedBody?: unknown;
    validatedParams?: unknown;
  }
}
