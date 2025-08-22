const request = require("supertest");

describe("POST /api/auth/password/forgot", () => {
  const route = "api/auth/password/forgot";

  it("returns 200 with a neutral message", async () => {
    const res = await request(global.app)
      .post(route)
      .send({ email: "test@test.com" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
