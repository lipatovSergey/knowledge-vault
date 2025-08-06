const request = require("supertest");
const app = require("../../../app");
const it = global.it;

describe("/api/users/me", () => {
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

  describe("GET /me", () => {
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

    it("should return 404 if user not found", async () => {
      await request(app).delete(route).set("Cookie", cookie);
      const res = await request(app).get(route).set("Cookie", cookie);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "User not found");
    });
  });

  describe("DELETE /me", () => {
    it("should delete user", async () => {
      const res = await request(app).delete(route).set("Cookie", cookie);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "User deleted");
    });

    it("should return 401 and message 'Anauthorized' if no session cookie was passed", async () => {
      const res = await request(app).delete(route);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Anauthorized");
    });

    it("should return 404 if user not found", async () => {
      const fakeId = "64ffacacacacacacacacacac";
      const fakeRes = await request(app).get(`/test/session/${fakeId}`);
      const fakeCookie = fakeRes.headers["set-cookie"];

      const res = await request(app).delete(route).set("Cookie", fakeCookie);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "User not found");
    });
  });
});
