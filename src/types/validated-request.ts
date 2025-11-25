import type { Request } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";

export type RequestWithValidatedBody<Body> = Request & {
  validatedBody: Body;
};

export type RequestWithValidatedParams<Params extends ParamsDictionary> = Request<Params> & {
  validatedParams: Params;
};

export type RequestWithValidatedQuery<Query extends ParsedQs = ParsedQs> = Request<
  ParamsDictionary,
  any,
  any,
  Query
> & { validatedQuery: Query };

export type RequestWithValidated<
  Body,
  Params extends ParamsDictionary = ParamsDictionary,
> = RequestWithValidatedBody<Body> & RequestWithValidatedParams<Params>;
