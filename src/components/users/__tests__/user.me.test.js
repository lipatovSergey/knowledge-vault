const request = require("supertest");
const it = global.it;

describe("/api/users/me", () => {
  const route = "/api/users/me";
  let agent;

  beforeEach(async () => {
    agent = request.agent(global.app);
    await agent.post("/api/users").send({
      name: "User",
      email: "test@example.com",
      password: "pass123",
    });
    await agent.post("/api/users/login").send({
      email: "test@example.com",
      password: "pass123",
    });
  });

  describe("GET /me", () => {
    it("should get user's data", async () => {
      const res = await agent.get(route);
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
      const res = await agent.delete(route);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "User deleted");
    });

    it("should return 401 and message 'Unauthorized' if no session cookie was passed", async () => {
      const res = await request(global.app).delete(route);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });
  });

  describe("PATCH /me", () => {
    it("should return 401 and 'Unauthorized' if no session cookie was passed", async () => {
      const res = await request(global.app).patch(route);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 400 if name wasn't passed", async () => {
      const res = await agent.patch(route).send({
        name: "",
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.name[0]).toBe("Name is required");
    });

    it("should update user's name field", async () => {
      const res = await agent.patch(route).send({
        name: "Updated",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("updatedName", "Updated");
    });

    it("should return 404 if user not found (fake session)", async () => {
      const agent = request.agent(global.app);
      const fakeId = "64ffacacacacacacacacacac"; // валидный ObjectId-формат

      await agent.post(`/test/session/${fakeId}`); // сессия сохранена
      const res = await agent.patch("/api/users/me").send({
        name: "Updated",
      }); // requireAuth пропустит
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "User not found");
    });
  });
});
