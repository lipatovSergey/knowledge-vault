import request from "supertest";
import * as mailbox from "../../../../tests/mailbox.helper";
import bcrypt from "bcrypt";
import { createExpiredResetToken } from "../../../../tests/helpers/password-reset-token.factory";
import { createExpectValidationError } from "../../../../tests/helpers/expect-validation-error.helper";
import type { AuthAgent } from "../../../../tests/test.types";
import { PasswordResetTokenString } from "../../../types/primitives";
import {
  badRequestErrorSchema,
  validationErrorSchema,
} from "../../../contracts/error/error.contract";

describe("POST /api/auth/password/reset", () => {
  const route = "/api/auth/password/reset";
  const email = "test@example.com";
  const expectValidationError = createExpectValidationError(route);
  let agent: AuthAgent;
  let emailToken: PasswordResetTokenString;

  beforeEach(async () => {
    mailbox.clear();
    agent = request.agent(global.app);
    await agent.post("/api/user").send({
      name: "User",
      email: email,
      password: "pass123",
    });
    await agent.post("/api/auth/password/forgot").send({ email: email });
    const message = mailbox.lastTo(email);
    expect(message).toBeDefined();
    expect(message?.meta).toBeDefined();
    expect(typeof message?.meta?.rawToken).toBe("string");
    emailToken = message!.meta!.rawToken as string;
  });

  it("get 204 if all required fields included in request body", async () => {
    const res = await agent.post(route).send({
      token: emailToken,
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });
    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});
  });

  it("get 204, updates password, old fails, new works", async () => {
    const res = await agent.post(route).send({
      token: emailToken,
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });
    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});

    const oldPasswordRes = await agent.post("/api/auth/login").send({
      email: email,
      password: "pass123",
    });
    expect(oldPasswordRes.statusCode).toBe(401);

    const newPasswordRes = await agent.post("/api/auth/login").send({
      email: email,
      password: "pass456",
    });
    expect(newPasswordRes.statusCode).toBe(200);
  });

  it("after successful password change destroy user's session", async () => {
    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "pass123",
    });
    const meResBefore = await agent.get("/api/user/me");
    expect(meResBefore.statusCode).toBe(200);
    const resetRes = await agent.post(route).send({
      token: emailToken,
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });
    expect(resetRes.statusCode).toBe(204);
    const meResAfter = await agent.get("/api/user/me");
    expect(meResAfter.statusCode).toBe(401);
  });

  it("get 400 if token from DB and token from request different", async () => {
    const res = await agent.post(route).send({
      token: "84663d4c6d2bc544986002e613f20080",
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });
    badRequestErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeUndefined();
  });

  it("after password reset request with old token should return 400", async () => {
    await agent.post(route).send({
      token: emailToken,
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });

    const res = await agent.post(route).send({
      token: emailToken,
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });
    badRequestErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeUndefined();
  });

  it("returns 400 if token expired", async () => {
    const selector = "some-selector-for-expired-token";
    const validator = "some-validator-for-expired-token";
    const validatorHash = await bcrypt.hash(validator, 10);
    await createExpiredResetToken({ selector, validatorHash });

    const res = await agent.post(route).send({
      token: `${selector}.${validator}`,
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });
    badRequestErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeUndefined();
  });

  it("returns 400 if token validation fails", async () => {
    const res = await agent.post(route).send({
      token: "invalid-token-format.with/slash",
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });
    badRequestErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeUndefined();
  });

  it("returns 422 if password and password confirmation doesn't match", async () => {
    const res = await agent.post(route).send({
      token: emailToken,
      newPassword: "pass456",
      newPasswordConfirmation: "123qwer",
    });
    const body = validationErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(422);
    expectValidationError(body, [], 1);
  });

  it("returns 422 if new password shorter then 6 symbols", async () => {
    const res = await agent.post(route).send({
      token: emailToken,
      newPassword: "pass",
      newPasswordConfirmation: "pass",
    });
    const body = validationErrorSchema.parse(res.body);
    expect(res.statusCode).toBe(422);
    expectValidationError(body, ["newPassword", "newPasswordConfirmation"]);
  });
});
