const request = require("supertest");
const mailbox = require("../../../../tests/mailbox.helper.js")

describe("POST /api/auth/password/forgot", () => {
  const route = "/api/auth/password/forgot";
  const email = "test@example.com"

  beforeEach(() => mailbox.clear())

  it("drops a reset email into the mailbox for existing user", async () => {
    await request(global.app).post("/api/users").send({
      name: "User",
      email: email,
      password: "pass123"
    })

    const res = await request(global.app).post(route).send({ email })
    expect(res.statusCode).toBe(200)

    const msg = mailbox.lastTo(email)
    expect(msg).toBeDefined()
    expect(msg.type).toBe("password-reset")
  })

  it("returns 200 with a neutral message", async () => {
    const res = await request(global.app)
      .post(route)
      .send({ email: "test@test.com" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
