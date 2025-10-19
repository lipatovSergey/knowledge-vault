const request = require("supertest");
const it = global.it;
const {
  createExpectValidationError,
  createExpectUnauthorizedError,
  createExpectNotFoundError,
} = require("../../../../tests/helpers/expect-problem.factories.js");

describe("/api/users/me", () => {
  const route = "/api/user/me";
  let agent;
  const expectValidationError = createExpectValidationError(route);
  const expectUnauthorizedError = createExpectUnauthorizedError(route);
  const expectNotFoundError = createExpectNotFoundError(route);

  beforeEach(async () => {
    agent = request.agent(global.app);
    await agent.post("/api/user").send({
      name: "User",
      email: "test@example.com",
      password: "pass123",
    });
    await agent.post("/api/auth/login").send({
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

    it("should return 401 if no session cookie was passed", async () => {
      const res = await request(global.app).get(route);
      expectUnauthorizedError(res);
    });

    it("should return 404 if user not found (fake session)", async () => {
      const agent = request.agent(global.app);
      const fakeId = "64ffacacacacacacacacacac"; // валидный ObjectId-формат

      await agent.post(`/test/session/${fakeId}`); // сессия сохранена
      const res = await agent.get("/api/user/me"); // requireAuth пропустит
      expectNotFoundError(res);
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
      expectUnauthorizedError(res);
    });
  });

  describe("PATCH /me", () => {
    it("should update user's name field", async () => {
      const res = await agent.patch(route).send({
        name: "Updated",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("updatedName", "Updated");
    });

    it("should return 401 and 'Unauthorized' if no session cookie was passed", async () => {
      const res = await request(global.app).patch(route);
      expectUnauthorizedError(res);
    });

    it("should return 422 if name wasn't passed", async () => {
      const res = await agent.patch(route).send({
        name: "",
      });
      expectValidationError(res);
    });

    it("should return 404 if user not found (fake session)", async () => {
      const agent = request.agent(global.app);
      const fakeId = "64ffacacacacacacacacacac"; // валидный ObjectId-формат

      await agent.post(`/test/session/${fakeId}`); // сессия сохранена
      const res = await agent.patch("/api/user/me").send({
        name: "Updated",
      });
      expectNotFoundError(res);
    });
  });
});
