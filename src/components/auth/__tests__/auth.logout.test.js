const request = require("supertest");
const {
  createExpectUnauthorizedError,
} = require("../../../../tests/helpers/expect-problem.factories.js");

describe("User logout", () => {
  const route = "/api/auth/logout";
  const expectUnauthorizedError = createExpectUnauthorizedError(route);
  let agent;

  beforeEach(async () => {
    agent = request.agent(global.app);
    await agent.post("/api/user/").send({
      name: "User",
      email: "test@example.com",
      password: "pass123",
    });
    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "pass123",
    });
  });

  it("should logout user and delete session", async () => {
    const meResBefore = await agent.get("/api/user/me");
    expect(meResBefore.statusCode).toBe(200);
    const res = await agent.post(route);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Logged out");
    expect(res.headers["set-cookie"][0]).toMatch(/connect\.sid=;/);
    const meResAfter = await agent.get("/api/user/me");
    expect(meResAfter.statusCode).toBe(401);
  });

  it("should return 401 and message 'Unauthorized' if no session cookie was passed", async () => {
    const res = await request(global.app).post(route);
    expectUnauthorizedError(res);
  });
});
