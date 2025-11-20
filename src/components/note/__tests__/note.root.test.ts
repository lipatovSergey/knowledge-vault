import request from "supertest";
import type { AuthAgent } from "../../../../tests/test.types";
import { createExpectValidationError } from "../../../../tests/helpers/expect-validation-error.helper";
import { noteRootPostResponseSchema } from "../../../contracts/note/root.contract";
import {
  unauthorizedErrorSchema,
  validationErrorSchema,
} from "../../../contracts/error/error.contract";

describe("/api/note/", () => {
  const route = "/api/note";
  let agent: AuthAgent;
  const expectValidationError = createExpectValidationError(route);

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
  describe("POST", () => {
    it("should create new note for user and return mapped object", async () => {
      const note = {
        title: "some-test-title",
        content: "some-test-content",
      };
      const res = await agent.post(route).send({ title: note.title, content: note.content });
      expect(res.statusCode).toBe(201);
      noteRootPostResponseSchema.parse(res.body);

      const getRes = await agent.get(`${route}/${res.body.id}`);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          id: res.body.id,
          title: note.title,
          content: note.content,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    it.each([
      ["title", { title: "", content: "valid-content" }, ["title"]],
      ["content", { title: "valid-title", content: "" }, ["content"]],
    ])(
      "should throw 422 error if empty %s was passed in note data",
      async (_, invalidData, expectedFields) => {
        const res = await agent.post(route).send(invalidData);
        expect(res.statusCode).toBe(422);
        const body = validationErrorSchema.parse(res.body);
        expectValidationError(body, expectedFields);
      },
    );

    it.each([
      ["title", { content: "valid-content" }, ["title"]],
      ["content", { title: "valid-title" }, ["content"]],
    ])(
      "should throw 422 error if %s was not passed in note data",
      async (_, invalidData, expectedFields) => {
        const res = await agent.post(route).send(invalidData);
        expect(res.statusCode).toBe(422);
        const body = validationErrorSchema.parse(res.body);
        expectValidationError(body, expectedFields);
      },
    );

    it("throws 422 error if title longer then 120 symbols", async () => {
      const noteData = { title: "a".repeat(121), content: "valid-content" };
      const res = await agent.post(route).send(noteData);
      expect(res.statusCode).toBe(422);
      const body = validationErrorSchema.parse(res.body);
      expectValidationError(body, ["title"]);
    });

    it("throws 422 error if content longer then 2000 symbols", async () => {
      const noteData = { title: "valid-title", content: "a".repeat(2001) };
      const res = await agent.post(route).send(noteData);
      expect(res.statusCode).toBe(422);
      const body = validationErrorSchema.parse(res.body);
      expectValidationError(body, ["content"]);
    });

    it("throws 401 error if user not authorized", async () => {
      const noteData = { title: "valid-title", content: "valid-content" };
      const res = await request(global.app).post(route).send(noteData);
      expect(res.statusCode).toBe(401);
      unauthorizedErrorSchema.parse(res.body);
    });
  });

  describe("GET", () => {});
});
