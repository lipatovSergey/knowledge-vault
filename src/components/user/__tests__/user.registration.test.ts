import request from "supertest";
import { createExpectValidationError } from "../../../../tests/helpers/expect-validation-error.helper";
import type { MessageResponse, SupertestResponse } from "../../../../tests/test.types";
import {
  conflictErrorSchema,
  validationErrorSchema,
} from "../../../contracts/error/error.contract";
import { userRootPostResponseSchema } from "../../../contracts/user/root.contract";

describe("User registration", () => {
  const route = "/api/user";
  const expectValidationError = createExpectValidationError(route);

  it("should register a new user", async () => {
    const res: SupertestResponse<MessageResponse> = await request(global.app).post(route).send({
      name: "Test User",
      email: "test@example.com",
      password: "pass123",
    });
    userRootPostResponseSchema.parse(res.body);
    expect(res.statusCode).toBe(201);
  });

  it("should return 422 and errors for invalid types of fields", async () => {
    const res = await request(global.app).post(route).send({
      name: 123,
      email: 123,
      password: 123,
    });
    const body = validationErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(422);
    expectValidationError(body, ["name", "email", "password"]);
  });

  it("should return 422 if name was not passed", async () => {
    const res = await request(global.app).post(route).send({
      name: "",
      email: "test@example.com",
      password: "pass123",
    });
    const body = validationErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(422);
    expectValidationError(body, ["name"]);
  });

  it("should return code 422  if email is invalid or empty string", async () => {
    const res = await request(global.app).post(route).send({
      name: "name",
      email: "test",
      password: "pass123",
    });
    const body = validationErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(422);
    expectValidationError(body, ["email"]);
  });

  it("should return code 422 if password is invalid or empty string", async () => {
    const res = await request(global.app).post(route).send({
      name: "name",
      email: "test@test.com",
      password: "",
    });
    const body = validationErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(422);
    expectValidationError(body, ["password"]);
  });

  it("should return 409 if user with used email exists", async () => {
    await request(global.app).post(route).send({
      name: "Test User",
      email: "test@example.com",
      password: "pass123",
    });
    const res = await request(global.app).post(route).send({
      name: "Test User",
      email: "test@example.com",
      password: "pass123",
    });
    conflictErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(409);
  });
});
