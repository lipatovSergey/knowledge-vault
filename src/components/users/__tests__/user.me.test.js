const request = require("supertest");
const it = global.it;

describe("/api/users/me", () => {
  const route = "/api/users/me";
  let cookie;

  beforeEach(async () => {
    await request(global.app).post("/api/users").send({
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

  describe("GET /me", () => {
    it("should get user's data", async () => {
      const res = await request(global.app).get(route).set("Cookie", cookie);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name", "User");
      expect(res.body).toHaveProperty("email", "test@example.com");
    });

    it("should return 401 and message 'Unauthorized' if no session cookie was passed", async () => {
      const res = await request(global.app).get(route);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 404 if user not found (fake session)", async () => {
      const agent = request.agent(global.app);
      const fakeId = "64ffacacacacacacacacacac"; // валидный ObjectId-формат

      await agent.post(`/test/session/${fakeId}`); // сессия сохранена
      const res = await agent.get("/api/users/me"); // requireAuth пропустит
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "User not found");
    });
  });

  describe("DELETE /me", () => {
    it("should delete user", async () => {
      const res = await request(global.app).delete(route).set("Cookie", cookie);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "User deleted");
    });

    it("should return 401 and message 'Unauthorized' if no session cookie was passed", async () => {
      const res = await request(global.app).delete(route);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });
  });
});
