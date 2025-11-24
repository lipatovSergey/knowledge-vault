import request from "supertest";
import type { AuthAgent, SupertestResponse } from "../../../../tests/test.types";
import {
  userMeGetResponseSchema,
  userMeDeleteResponseSchema,
  userMePatchResponseSchema,
  type UserMeDeleteResponse,
  type UserMePatchResponse,
  type UserMeGetResponse,
} from "../../../contracts/user/me.contract";
import { createExpectValidationError } from "../../../../tests/helpers/expect-validation-error.helper";
import {
  notFoundErrorSchema,
  unauthorizedErrorSchema,
  validationErrorSchema,
} from "../../../contracts/error/error.contract";

describe("/api/users/me", () => {
  const route = "/api/user/me";
  const expectValidationError = createExpectValidationError(route);
  let agent: AuthAgent;

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
      const res: SupertestResponse<UserMeGetResponse> = await agent.get(route);
      const body = userMeGetResponseSchema.parse(res.body);
      expect(res.statusCode).toBe(200);
      expect(body.name).toBe("User");
      expect(body.email).toBe("test@example.com");
    });

    it("should return 401 if no session cookie was passed", async () => {
      const res = await request(global.app).get(route);
      unauthorizedErrorSchema.parse(res.body);
      expect(res.statusCode).toBe(401);
    });

    it("should return 404 if user not found (fake session)", async () => {
      const agent = request.agent(global.app);
      const fakeId = "64ffacacacacacacacacacac";

      await agent.post(`/test/session/${fakeId}`);
      const res = await agent.get("/api/user/me");
      notFoundErrorSchema.parse(res.body);
      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /me", () => {
    it("should delete user", async () => {
      const res: SupertestResponse<UserMeDeleteResponse> = await agent.delete(route);
      const body = userMeDeleteResponseSchema.parse(res.body);
      expect(res.statusCode).toBe(200);
      expect(body.message).toBe("User deleted");
    });

    it("should return 401 and message 'Unauthorized' if no session cookie was passed", async () => {
      const res = await request(global.app).delete(route);
      unauthorizedErrorSchema.parse(res.body);
      expect(res.statusCode).toBe(401);
    });
  });

  describe("PATCH /me", () => {
    it("should update user's name field", async () => {
      const res: SupertestResponse<UserMePatchResponse> = await agent.patch(route).send({
        name: "updated-name",
      });
      expect(res.statusCode).toBe(200);
      const body = userMePatchResponseSchema.parse(res.body);
      expect(res.statusCode).toBe(200);
      expect(body.name).toBe("updated-name");
    });

    it("should return 401 and 'Unauthorized' if no session cookie was passed", async () => {
      const res = await request(global.app).patch(route);
      unauthorizedErrorSchema.parse(res.body);
      expect(res.statusCode).toBe(401);
    });

    it("should return 422 if nothing wasn't passed", async () => {
      const res = await agent.patch(route).send({});
      const body = validationErrorSchema.parse(res.body);

      expect(res.statusCode).toBe(422);
      expectValidationError(body, [], 1);
    });

    it("should return 404 if user not found (fake session)", async () => {
      const agent = request.agent(global.app);
      const fakeId = "64ffacacacacacacacacacac"; // валидный ObjectId-формат

      await agent.post(`/test/session/${fakeId}`); // сессия сохранена
      const res = await agent.patch("/api/user/me").send({
        name: "Updated",
      });
      notFoundErrorSchema.parse(res.body);
      expect(res.statusCode).toBe(404);
    });
  });
});
