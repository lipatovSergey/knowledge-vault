import request from "supertest";
import { createExpectValidationError } from "../../../../tests/helpers/expect-validation-error.helper";
import { authLoginResponseSchema } from "../../../contracts/auth/login.contract";
import {
  conflictErrorSchema,
  unauthorizedErrorSchema,
  validationErrorSchema,
} from "../../../contracts/error/error.contract";

describe("User login", () => {
  const route = "/api/auth/login";
  const expectValidationError = createExpectValidationError(route);

  beforeEach(async () => {
    await request(global.app).post("/api/user").send({
      name: "User",
      email: "test@example.com",
      password: "pass123",
    });
  });

  it("should log in with correct credentials", async () => {
    const res = await request(global.app).post(route).send({
      email: "test@example.com",
      password: "pass123",
    });
    authLoginResponseSchema.parse(res.body);
    expect(res.statusCode).toBe(200);
  });

  it("should set session cookie after successful login", async () => {
    const res = await request(global.app).post(route).send({
      email: "test@example.com",
      password: "pass123",
    });
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toMatch(/connect\.sid=/);
  });

  it("regenerates session ID on successful login", async () => {
    const agent = request.agent(global.app);
    // create guest session
    const touchRes = await agent.get("/test/touch");
    expect(touchRes.status).toBe(200);
    const cookieBefore = touchRes.headers["set-cookie"][0];
    expect(cookieBefore).toMatch(/connect\.sid=/);

    // login with the same agent
    const loginRes = await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "pass123",
    });
    expect(loginRes.status).toBe(200);
    const cookieAfter = loginRes.headers["set-cookie"][0];
    expect(cookieAfter).toMatch(/connect\.sid=/);

    // compare sessions ids
    const matchBefore = cookieBefore.match(/connect\.sid=([^;]+)/);
    const matchAfter = cookieAfter.match(/connect\.sid=([^;]+)/);

    expect(matchBefore).not.toBeNull();
    expect(matchAfter).not.toBeNull();

    const sidBefore = matchBefore![1];
    const sidAfter = matchAfter![1];
    expect(sidBefore).not.toBe(sidAfter);
  });

  it("should return 401 if email is incorrect", async () => {
    const res = await request(global.app).post(route).send({
      email: "wrong@example.com",
      password: "pass123",
    });
    unauthorizedErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 if password is incorrect", async () => {
    const res = await request(global.app).post(route).send({
      email: "test@example.com",
      password: "pass124",
    });
    unauthorizedErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(401);
  });

  it("should return 422 if email is an empty string", async () => {
    const res = await request(global.app).post(route).send({
      email: "",
      password: "pass123",
    });
    const body = validationErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(422);
    expectValidationError(body, ["email"]);
  });

  it("should return 422 if password is an empty string", async () => {
    const res = await request(global.app).post(route).send({
      email: "test@example.com",
      password: "",
    });
    const body = validationErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(422);
    expectValidationError(body, ["password"]);
  });

  it("should return 409 if user is already logged in", async () => {
    const firstRes = await request(global.app).post(route).send({
      email: "test@example.com",
      password: "pass123",
    });

    const cookie = firstRes.headers["set-cookie"];

    const res = await request(global.app).post(route).set("Cookie", cookie).send({
      email: "test@example.com",
      password: "pass123",
    });
    conflictErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(409);
  });
});
