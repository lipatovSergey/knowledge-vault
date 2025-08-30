const request = require("supertest");
const mailbox = require("../../../../tests/mailbox.helper.js");
const tokenStore = require("../token-memory.store.js");

describe("POST /api/auth/password/reset", () => {
  const route = "/api/auth/password/reset";
  const email = "test@example.com";
  let agent;
  let emailToken;

  beforeEach(async () => {
    mailbox.clear();
    tokenStore.clear();
    agent = request.agent(global.app);
    await agent.post("/api/users").send({
      name: "User",
      email: email,
      password: "pass123",
    });

    await agent.post("/api/auth/password/forgot").send({ email: email });
    const message = mailbox.lastTo(email);
    emailToken = message.meta.rawToken;
  });

  it("get 204 if all required fields included in request body", async () => {
    const res = await agent.post(route).send({
      email: email,
      token: emailToken,
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });
    expect(res.statusCode).toBe(204);
  });

  it("get 400 if token from DB and token from request different", async () => {
    const res = await agent.post(route).send({
      email: email,
      token: "84663d4c6d2bc544986002e613f20080",
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });
    expect(res.statusCode).toBe(400);
  });

  it("get 204, updates password, old fails, new works", async () => {
    const res = await agent.post(route).send({
      email: email,
      token: emailToken,
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });
    expect(res.statusCode).toBe(204);

    const oldPasswordRes = await agent.post("/api/users/login").send({
      email: email,
      password: "pass123",
    });
    expect(oldPasswordRes.statusCode).toBe(401);

    const newPasswordRes = await agent.post("/api/users/login").send({
      email: email,
      password: "pass456",
    });
    expect(newPasswordRes.statusCode).toBe(200);
  });

  it("after password reset request with old token should return 401", async () => {
    await agent.post(route).send({
      email: email,
      token: emailToken,
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });

    const res = await agent.post(route).send({
      email: email,
      token: emailToken,
      newPassword: "pass456",
      newPasswordConfirmation: "pass456",
    });
    expect(res.statusCode).toBe(400);
  });
});
