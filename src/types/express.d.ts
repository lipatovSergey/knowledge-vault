import "express-session";
import { PasswordResetTokenContract } from "./primitives";
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

export type RequestWithValidatedResetToken = import("express").Request & {
  validatedResetToken: PasswordResetTokenContract;
};

export type RequestWithValidatedParams<Params extends ParamsDictionary = ParamsDictionary> =
  import("express").Request & {
    validatedParams: Params;
  };
