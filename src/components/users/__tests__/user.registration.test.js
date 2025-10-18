const request = require("supertest");

describe("User registration", () => {
  const route = "/api/users";
  function expectValidationError(res, expectedFields = []) {
    expect(res.statusCode).toBe(422);
    expect(res.body).toMatchObject({
      title: "Validation failed",
      status: 422,
      type: "urn:problem:validation-error",
      instance: "/api/users",
      errors: { source: "body" },
    });
    expect(res.body.errors.fieldErrors).toEqual(
      expect.objectContaining(
        Object.fromEntries(
          expectedFields.map((key) => [key, expect.any(Array)]),
        ),
      ),
    );
  }

  it("should register a new user", async () => {
    const res = await request(global.app).post(route).send({
      name: "Test User",
      email: "test@example.com",
      password: "pass123",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User created successfully");
  });

  it("should return 422 and errors for invalid types of fields", async () => {
    const res = await request(global.app).post(route).send({
      name: 123,
      email: 123,
      password: 123,
    });
    expectValidationError(res, ["name", "email", "password"]);
  });

  it("should return 422 if name was not passed", async () => {
    const res = await request(global.app).post(route).send({
      name: "",
      email: "test@example.com",
      password: "pass123",
    });
    expectValidationError(res, ["name"]);
  });

  it("should return code 422  if email is invalid or empty string", async () => {
    const res = await request(global.app).post(route).send({
      name: "name",
      email: "test",
      password: "pass123",
    });
    expectValidationError(res, ["email"]);
  });

  it("should return code 422 if password is invalid or empty string", async () => {
    const res = await request(global.app).post(route).send({
      name: "name",
      email: "test@test.com",
      password: "",
    });
    expectValidationError(res, ["password"]);
  });

  it("should return 409 if user with used email exists", async () => {
    await request(global.app).post(route).send({
      name: " Test User",
      email: "test@example.com",
      password: "pass123",
    });
    const res = await request(global.app).post(route).send({
      name: " Test User",
      email: "test@example.com",
      password: "pass123",
    });
    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({
      title: "Conflict",
      detail: "User already exists",
      status: 409,
      type: "urn:problem:conflict",
      instance: "/api/users",
    });
  });
});
