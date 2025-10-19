function createExpectValidationError(instance) {
  return function expectValidationError(
    res,
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
        Object.fromEntries(
          expectedFields.map((key) => [key, expect.any(Array)]),
        ),
      ),
    );
    expect(res.body.errors.formErrors).toHaveLength(formErrorsLength);
  };
}

function createExpectConflictError(instance) {
  return function expectConflictError(res) {
    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({
      title: "Conflict",
      status: 409,
      type: "urn:problem:conflict",
      instance: instance,
    });
  };
}

function createExpectUnauthorizedError(instance) {
  return function expectUnauthorizedError(res) {
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({
      title: "Unauthorized",
      status: 401,
      type: "urn:problem:unauthorized",
      instance: instance,
    });
  };
}

function createExpectNotFoundError(instance) {
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

function createExpectBadRequestError(instance) {
  return function expectBadRequestError(res) {
    expect(res.body).toMatchObject({
      title: "Bad Request",
      status: 400,
      type: "urn:problem:bad-request",
      instance: instance,
    });
    expect(res.statusCode).toBe(400);
  };
}

module.exports = {
  createExpectValidationError,
  createExpectConflictError,
  createExpectUnauthorizedError,
  createExpectNotFoundError,
  createExpectBadRequestError,
};
