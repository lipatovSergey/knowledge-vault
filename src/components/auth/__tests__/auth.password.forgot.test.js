const request = require("supertest");
const mailbox = require("../../../../tests/mailbox.helper.js");

describe("POST /api/auth/password/forgot", () => {
  const route = "/api/auth/password/forgot";
  const email = "test@example.com";
  let agent;

  beforeEach(async () => {
    mailbox.clear();
    agent = request.agent(global.app);
    await agent.post("/api/users").send({
      name: "User",
      email: email,
      password: "pass123",
    });
  });

  it("drops a reset email into the mailbox for existing user", async () => {
    const res = await agent.post(route).send({ email });
    expect(res.statusCode).toBe(200);

    const msg = mailbox.lastTo(email);
    expect(msg).toBeDefined();
    expect(msg.type).toBe("password-reset");
  });

  it("returns 200 with a neutral message", async () => {
    const res = await agent.post(route).send({ email: "test@test.com" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 400 on invalid email format", async () => {
    const res = await agent.post(route).send({ email: "invalid" });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toHaveProperty("email");
  });

  it("includes a raw token in the reset email meta", async () => {
    await agent.post(route).send({ email: email });
    const msg = mailbox.lastTo(email);
    console.log(msg);
    expect(msg).toBeDefined();
    expect(msg.meta?.rawToken).toBeDefined();
  });
});
