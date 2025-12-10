import request from "supertest";
import type { AuthAgent } from "../../../../tests/test.types";
import { authLogoutResponseSchema } from "../../../contracts/auth/logout.contract";
import { unauthorizedErrorSchema } from "../../../contracts/error/error.contract";

describe("User logout", () => {
  const route = "/api/auth/logout";
  let agent: AuthAgent;

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
    const body = authLogoutResponseSchema.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body).toHaveProperty("message", "Logged out");
    expect(res.headers["set-cookie"][0]).toMatch(/connect\.sid=;/);
    const meResAfter = await agent.get("/api/user/me");
    expect(meResAfter.statusCode).toBe(401);
  });

  it("should return 401 and message 'Unauthorized' if no session cookie was passed", async () => {
    const res = await request(global.app).post(route);
    unauthorizedErrorSchema.parse(res.body);
  });
});
