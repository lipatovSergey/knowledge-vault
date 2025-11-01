import type { Request } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

export type RequestWithValidatedBody<Body> = Request & {
  validatedBody: Body;
};

export type RequestWithValidatedParams<
  Params extends ParamsDictionary,
> = Request<Params> & {
  validatedParams: Params;
};

export type RequestWithValidated<
  Body,
  Params extends ParamsDictionary = ParamsDictionary,
> = RequestWithValidatedBody<Body> &
  RequestWithValidatedParams<Params>;

