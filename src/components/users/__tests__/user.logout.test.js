const request = require("supertest");
const it = global.it;

describe("User logout", () => {
  const route = "/api/users/logout";
  let cookie;
  beforeEach(async () => {
    await request(global.app).post("/api/users/").send({
      name: "User",
      email: "test@example.com",
      password: "pass123",
    });
    const res = await request(global.app).post("/api/users/login").send({
      email: "test@example.com",
      password: "pass123",
    });
    cookie = res.headers["set-cookie"];
  });

  it("should logout user and delete session", async () => {
    const res = await request(global.app).post(route).set("Cookie", cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Logged out");
    expect(res.headers["set-cookie"][0]).toMatch(/connect\.sid=;/);
  });

  it("should return 401 and message 'Unauthorized' if no session cookie was passed", async () => {
    const res = await request(global.app).post(route);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });
});
