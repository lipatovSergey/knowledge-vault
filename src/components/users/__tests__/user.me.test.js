const request = require("supertest");
const app = require("../../../app");
const userServices = require("../user.services.js");
const it = global.it;

describe("User me, get user's info", () => {
  const route = "/api/users/me";
  let cookie;
  beforeEach(async () => {
    await request(app).post("/api/users").send({
      name: "User",
      email: "test@example.com",
      password: "pass123",
    });
    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "pass123",
    });
    cookie = res.headers["set-cookie"];
  });

  it("should get user's data", async () => {
    const res = await request(app).get(route).set("Cookie", cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "User");
    expect(res.body).toHaveProperty("email", "test@example.com");
  });

  it("should return 401 and message 'Anauthorized' if no session cookie was passed", async () => {
    const res = await request(app).get(route);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Anauthorized");
  });
});
