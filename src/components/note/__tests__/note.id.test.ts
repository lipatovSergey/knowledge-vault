import request from "supertest";
import type { AuthAgent } from "../../../../tests/test.types";
import type { MongoId } from "../../../types/primitives";
import {
  noteIdDeleteResponseSchema,
  noteIdGetResponseSchema,
  noteIdPatchResponseSchema,
} from "../../../contracts/note/id.contract";
import {
  badRequestErrorSchema,
  notFoundErrorSchema,
  unauthorizedErrorSchema,
  validationErrorSchema,
} from "../../../contracts/error/error.contract";
import { Types } from "mongoose";
import {
  createExpectValidationError,
  ValidationErrorExpectation,
} from "../../../../tests/helpers/expect-validation-error.helper";

describe("/api/note/:id", () => {
  let route: string;
  let agent: AuthAgent;
  let noteId: MongoId;
  let expectValidationError: ValidationErrorExpectation;

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
    const res = await agent.post("/api/note").send({
      title: "valid-title",
      content: "valid-content",
    });
    noteId = res.body.id;
    route = `/api/note/${noteId}`;
    expectValidationError = createExpectValidationError(route);
  });

  describe("GET", () => {
    it("return 200 status code and plain note object with id, title, content, createdAt, updatedAt fields", async () => {
      const res = await agent.get(route);
      expect(res.statusCode).toBe(200);
      const body = noteIdGetResponseSchema.parse(res.body);
      expect(body).toEqual(
        expect.objectContaining({
          title: "valid-title",
          content: "valid-content",
        }),
      );
    });

    it("returns 400 status code if passed note id invalid", async () => {
      const route = "/api/note/12345678";
      const res = await agent.get(route);
      expect(res.statusCode).toBe(400);
      const body = badRequestErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 404 status code if note wasn't found in DB", async () => {
      const missingId = new Types.ObjectId().toString();
      const route = `/api/note/${missingId}`;
      const res = await agent.get(route);
      expect(res.statusCode).toBe(404);
      const body = notFoundErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 404 status code if request send not by note's owner", async () => {
      // create new user with separate agent
      const intrudetAgent = request.agent(global.app);
      await intrudetAgent.post("/api/user").send({
        name: "User2",
        email: "test2@example.com",
        password: "pass1234",
      });
      await intrudetAgent.post("/api/auth/login").send({
        email: "test2@example.com",
        password: "pass1234",
      });

      const res = await intrudetAgent.get(route);
      expect(res.statusCode).toBe(404);
      const body = notFoundErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 401 status code if request was send by not authorized user", async () => {
      const res = await request(global.app).get(route);
      expect(res.statusCode).toBe(401);
      const body = unauthorizedErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 401 status code if user logged out before request send", async () => {
      await agent.post("/api/auth/logout");
      const res = await agent.get(route);
      expect(res.statusCode).toBe(401);
      const body = unauthorizedErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });
  });

  describe("DELETE", () => {
    it("Deletes note from DB returns 200 status code", async () => {
      const res = await agent.delete(route);
      expect(res.statusCode).toBe(200);
      const body = noteIdDeleteResponseSchema.parse(res.body);
      expect(body).toHaveProperty("message", "Note deleted");
    });

    it("returns 400 status code if passed note id invalid", async () => {
      const route = "/api/note/12345678";
      const res = await agent.delete(route);
      expect(res.statusCode).toBe(400);
      const body = badRequestErrorSchema.parse(res.body);
      expect(body).toHaveProperty("detail", "Invalid ObjectId");
      expect(body.instance).toBe(route);
    });

    it("returns 404 status code if delete request was send twice", async () => {
      await agent.delete(route);
      const res = await agent.delete(route);
      expect(res.statusCode).toBe(404);
      const body = notFoundErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 404 status code to get /api/note/:id after successful note delete", async () => {
      await agent.delete(route);
      const res = await agent.get(route);
      expect(res.statusCode).toBe(404);
      const body = notFoundErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 404 status code if note wasn't found in DB", async () => {
      const missingId = new Types.ObjectId().toString();
      const route = `/api/note/${missingId}`;
      const res = await agent.delete(route);
      expect(res.statusCode).toBe(404);
      const body = notFoundErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 404 status code if request send not by note's owner", async () => {
      // create new user with separate agent
      const intrudetAgent = request.agent(global.app);
      await intrudetAgent.post("/api/user").send({
        name: "User2",
        email: "test2@example.com",
        password: "pass1234",
      });
      await intrudetAgent.post("/api/auth/login").send({
        email: "test2@example.com",
        password: "pass1234",
      });

      const res = await intrudetAgent.delete(route);
      expect(res.statusCode).toBe(404);
      const body = notFoundErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 401 status code if request was send by not authorized user", async () => {
      const res = await request(global.app).delete(route);
      expect(res.statusCode).toBe(401);
      const body = unauthorizedErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 401 status code if user logged out before request send", async () => {
      await agent.post("/api/auth/logout");
      const res = await agent.delete(route);
      expect(res.statusCode).toBe(401);
      const body = unauthorizedErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });
  });
  describe("PATCH", () => {
    it("should update note's title in DB, returns 200 and updated note", async () => {
      const changedTitle = "changed-valid-title";
      const res = await agent.patch(route).send({
        title: changedTitle,
      });
      expect(res.statusCode).toBe(200);
      const body = noteIdPatchResponseSchema.parse(res.body);
      expect(body).toEqual(
        expect.objectContaining({
          title: changedTitle,
        }),
      );
    });

    it("should update note's content in DB, returns 200 and updated note", async () => {
      const changedContent = "changed-valid-content";
      const res = await agent.patch(route).send({
        content: changedContent,
      });
      expect(res.statusCode).toBe(200);
      const body = noteIdPatchResponseSchema.parse(res.body);
      expect(body).toEqual(
        expect.objectContaining({
          content: changedContent,
        }),
      );
    });

    it("should update note's title and content in DB, returns 200 and updated note", async () => {
      const changedTitle = "changed-valid-title";
      const changedContent = "changed-valid-content";
      const res = await agent.patch(route).send({
        title: changedTitle,
        content: changedContent,
      });
      expect(res.statusCode).toBe(200);
      const body = noteIdPatchResponseSchema.parse(res.body);
      expect(body).toEqual(
        expect.objectContaining({
          title: changedTitle,
          content: changedContent,
        }),
      );
    });

    it("returns 400 status code if passed note id invalid", async () => {
      const fakeRoute = "/api/note/12345678";
      const res = await agent.patch(fakeRoute);
      expect(res.statusCode).toBe(400);
      const body = badRequestErrorSchema.parse(res.body);
      expect(body.instance).toBe(fakeRoute);
    });

    it("return 422 if passed title empty string", async () => {
      const res = await agent.patch(route).send({
        title: "",
      });
      expect(res.statusCode).toBe(422);
      const body = validationErrorSchema.parse(res.body);
      expectValidationError(body, ["title"], 1);
    });

    it("return 422 if passed content empty string", async () => {
      const res = await agent.patch(route).send({
        content: "",
      });
      expect(res.statusCode).toBe(422);
      const body = validationErrorSchema.parse(res.body);
      expectValidationError(body, ["content"], 1);
    });

    it("returns 422 error if title longer then 120 symbols", async () => {
      const noteData = { title: "a".repeat(121) };
      const res = await agent.patch(route).send(noteData);
      expect(res.statusCode).toBe(422);
      const body = validationErrorSchema.parse(res.body);
      expectValidationError(body, ["title"], 1);
    });

    it("returns 422 error if content longer then 2000 symbols", async () => {
      const noteData = { content: "a".repeat(2001) };
      const res = await agent.patch(route).send(noteData);
      expect(res.statusCode).toBe(422);
      const body = validationErrorSchema.parse(res.body);
      expectValidationError(body, ["content"], 1);
    });

    it("returns 422 status code if passed empty body", async () => {
      const res = await agent.patch(route).send({});
      expect(res.statusCode).toBe(422);
      const body = validationErrorSchema.parse(res.body);
      expectValidationError(body, [], 1);
    });

    it("returns 404 status code if note wasn't found in DB", async () => {
      const missingId = new Types.ObjectId().toString();
      const route = `/api/note/${missingId}`;
      const res = await agent.patch(route).send({
        title: "changed-title",
      });
      expect(res.statusCode).toBe(404);
      const body = notFoundErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 404 status code if request send not by note's owner", async () => {
      // create new user with separate agent
      const intrudetAgent = request.agent(global.app);
      await intrudetAgent.post("/api/user").send({
        name: "User2",
        email: "test2@example.com",
        password: "pass1234",
      });
      await intrudetAgent.post("/api/auth/login").send({
        email: "test2@example.com",
        password: "pass1234",
      });

      const res = await intrudetAgent.patch(route).send({
        title: "changed-title",
      });
      expect(res.statusCode).toBe(404);
      const body = notFoundErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 401 status code if request was send by not authorized user", async () => {
      const res = await request(global.app).patch(route);
      expect(res.statusCode).toBe(401);
      const body = unauthorizedErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });

    it("returns 401 status code if user logged out before request send", async () => {
      await agent.post("/api/auth/logout");
      const res = await agent.patch(route);
      expect(res.statusCode).toBe(401);
      const body = unauthorizedErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });
  });
});
