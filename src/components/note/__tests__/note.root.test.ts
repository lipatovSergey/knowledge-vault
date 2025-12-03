import request from "supertest";
import type { AuthAgent } from "../../../../tests/test.types";
import { createExpectValidationError } from "../../../../tests/helpers/expect-validation-error.helper";
import {
  noteRootGetResponseSchema,
  noteRootPostResponseSchema,
} from "../../../contracts/note/root.contract";
import {
  badRequestErrorSchema,
  unauthorizedErrorSchema,
  validationErrorSchema,
} from "../../../contracts/error/error.contract";
import { insertNotesDirectly } from "../../../../tests/helpers/insert-notes.helper";
import { MongoId } from "../../../types/primitives";
import { NoteDocument } from "../note.model";

describe("/api/note/", () => {
  const route = "/api/note";
  let agent: AuthAgent;
  let userId: MongoId;
  const expectValidationError = createExpectValidationError(route);

  beforeAll(async () => {
    agent = request.agent(global.app);
    await agent.post("/api/user").send({
      name: "User",
      email: "test@example.com",
      password: "pass123",
    });
    const res = await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "pass123",
    });
    userId = res.body.id;
  });

  describe("POST", () => {
    const note = {
      title: "some-test-title",
      content: "some-test-content",
    };
    it("should create new note for user and return mapped object", async () => {
      const res = await agent.post(route).send({ title: note.title, content: note.content });
      expect(res.statusCode).toBe(201);
      noteRootPostResponseSchema.parse(res.body);

      const getRes = await agent.get(`${route}/${res.body.id}`);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          id: res.body.id,
          title: note.title,
          content: note.content,
          tags: [],
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    it("should create new note with array of tags if tags, were passed", async () => {
      const tags = ["tag1", "tag2"];
      const res = await agent
        .post(route)
        .send({ title: note.title, content: note.content, tags: tags });
      expect(res.statusCode).toBe(201);
      noteRootPostResponseSchema.parse(res.body);

      const getRes = await agent.get(`${route}/${res.body.id}`);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          tags: tags,
        }),
      );
    });

    it.each([
      ["title", { title: "", content: "valid-content" }, ["title"]],
      ["content", { title: "valid-title", content: "" }, ["content"]],
    ])(
      "should return 422 error if empty %s was passed in note data",
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
      "should return 422 error if %s was not passed in note data",
      async (_, invalidData, expectedFields) => {
        const res = await agent.post(route).send(invalidData);
        expect(res.statusCode).toBe(422);
        const body = validationErrorSchema.parse(res.body);
        expectValidationError(body, expectedFields);
      },
    );

    it("should return 422 error if title longer then 120 symbols", async () => {
      const noteData = { title: "a".repeat(121), content: "valid-content" };
      const res = await agent.post(route).send(noteData);
      expect(res.statusCode).toBe(422);
      const body = validationErrorSchema.parse(res.body);
      expectValidationError(body, ["title"]);
    });

    it("should return 422 error if content longer then 2000 symbols", async () => {
      const noteData = { title: "valid-title", content: "a".repeat(2001) };
      const res = await agent.post(route).send(noteData);
      expect(res.statusCode).toBe(422);
      const body = validationErrorSchema.parse(res.body);
      expectValidationError(body, ["content"]);
    });

    it("should return 401 error if user not authorized", async () => {
      const noteData = { title: "valid-title", content: "valid-content" };
      const res = await request(global.app).post(route).send(noteData);
      expect(res.statusCode).toBe(401);
      const body = unauthorizedErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });
  });

  describe("GET", () => {
    let validNotesList: NoteDocument[];
    beforeEach(async () => {
      validNotesList = await insertNotesDirectly(userId, 3);
    });

    it("should return 200 status and array of all user's default version notes", async () => {
      const res = await agent.get(route);
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body).toMatchObject({
        data: expect.arrayContaining(
          validNotesList.map((note) =>
            expect.objectContaining({
              title: note.title,
            }),
          ),
        ),
        total: validNotesList.length,
        page: 1,
        limit: 20,
      });
      const expectedKeys = ["title", "id", "updatedAt"];
      body.data.forEach((item) => {
        expect(item).toMatchObject({
          id: expect.any(String),
          updatedAt: expect.any(String),
        });
        expect(Object.keys(item).sort()).toEqual(expectedKeys.sort());
      });
    });

    it("should return 200 status and array of all user's notes with content field", async () => {
      const res = await agent.get(route).query({ fields: "content" });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body).toMatchObject({
        data: expect.arrayContaining(
          validNotesList.map((note) =>
            expect.objectContaining({
              content: note.content,
              id: expect.any(String),
            }),
          ),
        ),
        total: validNotesList.length,
        page: 1,
        limit: 20,
      });
    });

    it("should return 200 status and array of all user's notes with tags field", async () => {
      const res = await agent.get(route).query({ fields: "tags" });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body).toMatchObject({
        data: expect.arrayContaining(
          validNotesList.map((note) =>
            expect.objectContaining({
              tags: note.tags,
              id: expect.any(String),
            }),
          ),
        ),
        total: validNotesList.length,
        page: 1,
        limit: 20,
      });
    });

    it("should return notes with tags and content when fields are passed as repeated params", async () => {
      const res = await agent.get(route).query({ fields: ["tags", "content"] });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body).toMatchObject({
        data: expect.arrayContaining(
          validNotesList.map((note) =>
            expect.objectContaining({
              content: note.content,
              tags: note.tags,
              id: expect.any(String),
            }),
          ),
        ),
        total: validNotesList.length,
        page: 1,
        limit: 20,
      });
    });

    it("should return notes with tags and content when fields are passed as comma-separated params", async () => {
      const res = await agent.get(route).query({ fields: "tags,content" });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body).toMatchObject({
        data: expect.arrayContaining(
          validNotesList.map((note) =>
            expect.objectContaining({
              content: note.content,
              tags: note.tags,
              id: expect.any(String),
            }),
          ),
        ),
        total: validNotesList.length,
        page: 1,
        limit: 20,
      });
    });

    it("should return 400 BadRequest error, if invalid value set in fields query", async () => {
      const res = await agent.get(route).query({ fields: "invalid-value" });
      expect(res.statusCode).toBe(400);
      badRequestErrorSchema.parse(res.body);
    });

    it("should return 401 if request was send by unauthorized user", async () => {
      const res = await request(global.app).get(route);
      expect(res.statusCode).toBe(401);
      const body = unauthorizedErrorSchema.parse(res.body);
      expect(body.instance).toBe(route);
    });
  });

  describe("GET pagingation tests", () => {
    let validNotesList: NoteDocument[];
    const noteTotalAmount = 25;
    beforeEach(async () => {
      validNotesList = await insertNotesDirectly(userId, noteTotalAmount);
    });

    it("should return 200 with default page/limit when no pagingation params are provided", async () => {
      const res = await agent.get(route);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(20);
      expect(body.data.length).toBe(body.limit);
      expect(body.total).toBe(noteTotalAmount);
    });

    it("should return 200 with limit that provided in pagingation params", async () => {
      const res = await agent.get(route).query({ limit: 5 });
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(5);
      expect(body.data.length).toBe(body.limit);
      expect(body.total).toBe(noteTotalAmount);
    });

    it("should return 200 with empty array in data when the requested page is beyond the available notes", async () => {
      const res = await agent.get(route).query({ page: 5, limit: 10 });
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.data).toHaveLength(0);
      expect(body.page).toBe(5);
      expect(body.limit).toBe(10);
      expect(body.total).toBe(noteTotalAmount);
    });

    it("should return 200 with correct slice of notes that requested by pagingation params", async () => {
      const res = await agent.get(route).query({ page: 2, limit: 10 });
      const body = noteRootGetResponseSchema.parse(res.body);
      const titles = body.data.map((n) => n.title);
      const expected = validNotesList.slice(10, 20).map((n) => n.title);
      expect(titles).toEqual(expected);
    });

    it("should return 400 BadRequest error if invalid value pathed to page param", async () => {
      const res = await agent.get(route).query({ page: 0 });
      expect(res.statusCode).toBe(400);
      badRequestErrorSchema.parse(res.body);
    });

    it("should return 400 BadRequest error if invalid value pathed to limit param", async () => {
      const res = await agent.get(route).query({ limit: 101 });
      expect(res.statusCode).toBe(400);
      badRequestErrorSchema.parse(res.body);
    });
  });
});
