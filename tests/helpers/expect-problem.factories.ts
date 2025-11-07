import type { Response } from "supertest";

type ErrorExpectation = (res: Response) => void;

type ValidationErrorExpectation = (
  res: Response,
  expectedFields?: string[],
  formErrorsLength?: number,
  source?: string,
) => void;

export function createExpectValidationError(instance: string): ValidationErrorExpectation {
  return function expectValidationError(
    res: Response,
    expectedFields = [],
    formErrorsLength = 0,
    source = "body",
  ) {
    expect(res.statusCode).toBe(422);
    expect(res.body).toMatchObject({
      title: "Validation failed",
      status: 422,
      type: "urn:problem:validation-error",
      instance: instance,
      errors: { source: source },
    });
    expect(res.body.errors.fieldErrors).toEqual(
      expect.objectContaining(
        Object.fromEntries(expectedFields.map((key) => [key, expect.any(Array)])),
      ),
    );
    expect(res.body.errors.formErrors).toHaveLength(formErrorsLength);
  };
}

export function createExpectConflictError(instance: string): ErrorExpectation {
  return function expectConflictError(res: Response) {
    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({
      title: "Conflict",
      status: 409,
      type: "urn:problem:conflict",
      instance: instance,
    });
  };
}

export function createExpectUnauthorizedError(instance: string): ErrorExpectation {
  return function expectUnauthorizedError(res: Response) {
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({
      title: "Unauthorized",
      status: 401,
      type: "urn:problem:unauthorized",
      instance: instance,
    });
  };
}

export function createExpectNotFoundError(instance: string): ErrorExpectation {
  return function expectNotFoundError(res) {
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      title: "Not found",
      status: 404,
      type: "urn:problem:not-found",
      instance: instance,
    });
  };
}

export function createExpectBadRequestError(instance: string): ErrorExpectation {
  return function expectBadRequestError(res: Response) {
    expect(res.body).toMatchObject({
      title: "Bad Request",
      status: 400,
      type: "urn:problem:bad-request",
      instance: instance,
    });
    expect(res.statusCode).toBe(400);
  };
}
