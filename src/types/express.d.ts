import "express-session";
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    validatedBody?: unknown;
    validatedParams?: ParamsDictionary;
    validatedResetToken?: string;
  }
}

export type RequestWithValidatedBody<Body> = import("express").Request & {
  validatedBody: Body;
};

export type RequestWithValidatedParams<
  Params extends ParamsDictionary = ParamsDictionary,
> = import("express").Request & {
  validatedParams: Params;
};
