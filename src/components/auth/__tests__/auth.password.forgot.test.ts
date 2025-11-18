import request from "supertest";
import * as mailbox from "../../../../tests/mailbox.helper";
import type { AuthAgent } from "../../../../tests/test.types";
import { createExpectValidationError } from "../../../../tests/helpers/expect-validation-error.helper";
import { validationErrorSchema } from "../../../contracts/error/error.contract";

describe("POST /api/auth/password/forgot", () => {
  const route = "/api/auth/password/forgot";
  const email = "test@example.com";
  const expectValidationError = createExpectValidationError(route);
  let agent: AuthAgent;

  beforeEach(async () => {
    mailbox.clear();
    agent = request.agent(global.app);
    await agent.post("/api/user").send({
      name: "User",
      email: email,
      password: "pass123",
    });
  });

  it("drops a reset email into the mailbox for existing user", async () => {
    const res = await agent.post(route).send({ email });
    expect(res.body).toEqual({});
    expect(res.statusCode).toBe(204);

    const msg = mailbox.lastTo(email);
    expect(msg).toBeDefined();
    expect(msg!.type).toBe("password-reset");
  });

  it("returns 204", async () => {
    const res = await agent.post(route).send({ email });
    expect(res.body).toEqual({});
    expect(res.statusCode).toBe(204);
  });

  it("includes a raw token in the reset email meta", async () => {
    await agent.post(route).send({ email: email });
    const msg = mailbox.lastTo(email);
    expect(msg).toBeDefined();
    expect(msg!.meta!.rawToken).toBeDefined();
  });

  it("returns 204 even if there no user with passed email in DB", async () => {
    const res = await agent.post(route).send({ email: "notdbemail@gmail.com" });
    expect(res.body).toEqual({});
    expect(res.statusCode).toBe(204);
  });

  it("if user sends request twice new token replace the old one", async () => {
    await agent.post(route).send({ email });
    const oldToken = mailbox.lastTo(email)!.meta!.rawToken;
    await agent.post(route).send({ email });
    const newToken = mailbox.lastTo(email)!.meta!.rawToken;
    expect(oldToken).not.toEqual(newToken);
  });

  it("returns 422 on invalid email format", async () => {
    const res = await agent.post(route).send({ email: "invalid" });
    const body = validationErrorSchema.parse(res.body);
    expectValidationError(body, ["email"]);
  });
});
