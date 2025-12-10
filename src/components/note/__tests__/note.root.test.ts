import request from "supertest";
import { createExpectValidationError } from "../../../../tests/helpers/expect-validation-error.helper";
import {
  type InsertNotes,
  insertNotesDirectly,
} from "../../../../tests/helpers/insert-notes.helper";
import type { AuthAgent } from "../../../../tests/test.types";
import {
  badRequestErrorSchema,
  unauthorizedErrorSchema,
  validationErrorSchema,
} from "../../../contracts/error/error.contract";
import {
  noteRootGetResponseSchema,
  noteRootPostResponseSchema,
} from "../../../contracts/note/root.contract";
import type { MongoId } from "../../../types/primitives";
import type { NoteDocument } from "../note.model";

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
    const notes = [] as InsertNotes;
    for (let i = 3; i > 0; i--) {
      notes.push({
        title: `title-${i}`,
        content: `content-${i}`,
        tags: ["tag1", "tag2"],
      });
    }
    beforeEach(async () => {
      validNotesList = await insertNotesDirectly(userId, notes);
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

    it("should return 200 status and empty tags array if note doesn't contain any tags", async () => {
      const postRes = await agent.post(route).send({ title: "empty-tags", content: "empty-tags" });
      const res = await agent.get(route).query({ fields: "tags, title" });
      const body = noteRootGetResponseSchema.parse(res.body);
      const emptyTagsNote = body.data.find((n) => n.id === postRes.body.id);
      expect(emptyTagsNote?.tags).toHaveLength(0);
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

  describe("GET pagination tests", () => {
    let validNotesList: NoteDocument[];
    const now = Date.now();
    const notes = [] as InsertNotes;
    const noteTotalAmount = 25;
    for (let i = noteTotalAmount; i > 0; i--) {
      notes.push({
        title: `title-${i}`,
        content: `content-${i}`,
        tags: ["tag1", "tag2"],
        updatedAt: new Date(now + i),
        createdAt: new Date(now + i),
      });
    }
    beforeEach(async () => {
      validNotesList = await insertNotesDirectly(userId, notes);
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

  describe("GET search by title and content", () => {
    let validNotesList: NoteDocument[];
    const searchString = "some-value";
    const notes = [
      {
        title: searchString,
        content: "content-1",
      },
      {
        title: "title-1",
        content: searchString,
      },
      {
        title: "No.De/^$",
        content: "content-No.De",
      },
      {
        title: searchString,
        content: "content-3",
        tags: ["tag-1"],
      },
      {
        title: "NoDe",
        content: "content-4",
      },
    ] as InsertNotes;

    beforeEach(async () => {
      validNotesList = await insertNotesDirectly(userId, notes);
    });

    it("should return 200 and notes whose titles or contents contain the search term", async () => {
      const res = await agent.get(route).query({ search: searchString });
      expect(res.statusCode).toBe(200);
      const expected = validNotesList.flatMap((n) =>
        n.title === searchString || n.content === searchString ? n._id.toString() : [],
      );
      const body = noteRootGetResponseSchema.parse(res.body);
      const returnedIds = body.data.map((n) => n.id);
      expect(returnedIds.sort()).toEqual(expected.sort());
    });

    it("should return 200 and matches titles case-insensitively ('node' finds 'NoDe')", async () => {
      const res = await agent.get(route).query({ search: "node" });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.total).toBe(1);
      expect(body.data[0].title).toBe("NoDe");
    });

    it("should return 200 and empty array when no match", async () => {
      const res = await agent.get(route).query({ search: "value-not-from-db" });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.data).toHaveLength(0);
    });

    it("should return 200 and treats empty search as no filter", async () => {
      const res = await agent.get(route).query({ search: "" });
      expect(res.status).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.data.length).toEqual(notes.length);
    });

    it("should return 200 and notes list limites by pagingation", async () => {
      const res = await agent.get(route).query({ search: searchString, limit: 1 });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.data).toHaveLength(1);
      expect(body.total).toBe(3);
    });

    it("should return 200 and notes only with requested fields", async () => {
      const res = await agent.get(route).query({ fields: "content", search: "node" });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      const expectedKeys = ["id", "content"];
      body.data.forEach((item) => {
        expect(item).toMatchObject({
          id: expect.any(String),
          content: expect.any(String),
        });
        expect(Object.keys(item).sort()).toEqual(expectedKeys.sort());
      });
    });

    it("should return 200 and notes only with requested search and tags", async () => {
      const res = await agent
        .get(route)
        .query({ search: searchString, tags: "tag-1", fields: "tags" });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.total).toBe(1);
      body.data.forEach((n) => expect(n.tags).toContain("tag-1"));
    });

    it("should return 200 and treats regex metacharacters as literals", async () => {
      const res = await agent.get(route).query({ search: "No.De/^$" });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      body.data.forEach((n) => expect(n.title).toEqual("No.De/^$"));
    });

    it("should return 400 BadRequest when the search string exceeds the max length", async () => {
      const res = await agent.get(route).query({ search: "a".repeat(121) });
      expect(res.statusCode).toBe(400);
      badRequestErrorSchema.parse(res.body);
    });

    it("isolates search results per-user, each user sees only their own matching notes", async () => {
      const secondAgent = request.agent(global.app);
      await secondAgent.post("/api/user").send({
        name: "User2",
        email: "test2@example.com",
        password: "pass1234",
      });
      await secondAgent.post("/api/auth/login").send({
        email: "test2@example.com",
        password: "pass1234",
      });
      const equalNote = { title: "title-equal", content: "content-equal" };
      await secondAgent.post(route).send(equalNote);
      await agent.post(route).send(equalNote);
      const res = await agent.get(route).query({ search: equalNote.title });
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.data[0].title).toEqual(equalNote.title);
      expect(body.data).toHaveLength(1);
      const secondRes = await secondAgent.get(route).query({ search: equalNote.title });
      const secondBody = noteRootGetResponseSchema.parse(secondRes.body);
      expect(secondBody.data[0].title).toEqual(equalNote.title);
      expect(secondBody.data).toHaveLength(1);
    });
  });

  describe("GET tags filter", () => {
    let validNotesList: NoteDocument[];
    const notes = [
      {
        title: "title-1",
        content: "content-1",
        tags: ["tag-1", "tag-2"],
      },
      {
        title: "title-2",
        content: "content-1",
        tags: ["tag-2"],
      },
      {
        title: "title-3",
        content: "content-1",
        tags: ["tag-2", "tag-1"],
      },
    ];
    beforeEach(async () => {
      validNotesList = await insertNotesDirectly(userId, notes);
    });

    it("should return 200 and only the notes that contain requested tags ", async () => {
      const tag = "tag-1";
      const res = await agent.get(route).query({ tags: tag });
      expect(res.statusCode).toBe(200);
      const expected = validNotesList
        .filter((n) => n.tags.includes(tag))
        .map((n) => n._id.toString());
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.data).toHaveLength(expected.length);
      body.data.forEach((n) => {
        expect(expected).toContain(n.id);
      });
    });

    it("should return 200 and works fluent with multiple tags", async () => {
      const tags = ["tag-1", "tag-2"];
      const res = await agent.get(route).query({ tags: tags });
      expect(res.statusCode).toBe(200);
      const expected = validNotesList
        .filter((n) => tags.every((t) => n.tags.includes(t)))
        .map((n) => n._id.toString());
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.data).toHaveLength(expected.length);
      body.data.forEach((n) => {
        expect(expected).toContain(n.id);
      });
    });

    it("should return 200 and return empty array when no tags match", async () => {
      const res = await agent.get(route).query({ tags: "tag-not-from-db" });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.data).toHaveLength(0);
    });

    it("should return 400 BadRequest if more then 100 tags passed", async () => {
      const arr = Array.from({ length: 101 }, (_, i) => `tag-${i}`);
      const res = await agent.get(route).query({ tags: arr });
      expect(res.statusCode).toBe(400);
      badRequestErrorSchema.parse(res.body);
    });

    it("should return 400 BadRequest even if one tag invalid", async () => {
      const res = await agent.get(route).query({ tags: "inv@lid-t@g" });
      expect(res.statusCode).toBe(400);
      badRequestErrorSchema.parse(res.body);
    });

    it("should accept comma-separated tags and repeated params", async () => {
      const commaRes = await agent.get(route).query({ tags: "tag-1,tag-2" });
      expect(commaRes.statusCode).toBe(200);
      const commaBody = noteRootGetResponseSchema.parse(commaRes.body);
      const arrayRes = await agent.get(route).query({ tags: ["tag-1", "tag-2"] });
      expect(arrayRes.statusCode).toBe(200);
      const arrayBody = noteRootGetResponseSchema.parse(arrayRes.body);
      expect(commaBody).toEqual(arrayBody);
    });

    it("returns 200 with correct pagination when filtering by tags (limit=1, page=2 yields one item and total 2)", async () => {
      const res = await agent.get(route).query({ tags: "tag-1", limit: 1, page: 2 });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.data).toHaveLength(1);
      expect(body.total).toBe(2);
    });

    it("returns 200 and respects fields projection when filtering by tags (content is included)", async () => {
      const res = await agent.get(route).query({ tags: "tag-1", fields: "content" });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      body.data.forEach((n) => expect(n).toHaveProperty("content"));
    });

    it("returns 200 and applies both title search and tag filter (only notes with the searched title remain)", async () => {
      const titleToSearch = "title-3";
      const res = await agent.get(route).query({ search: titleToSearch, tags: "tag-1" });
      expect(res.statusCode).toBe(200);
      const body = noteRootGetResponseSchema.parse(res.body);
      body.data.forEach((n) => expect(n.title).toEqual(titleToSearch));
    });

    it("isolates tags filter results per-user, each user sees only their own matching notes", async () => {
      const secondAgent = request.agent(global.app);
      await secondAgent.post("/api/user").send({
        name: "User2",
        email: "test2@example.com",
        password: "pass1234",
      });
      await secondAgent.post("/api/auth/login").send({
        email: "test2@example.com",
        password: "pass1234",
      });
      const equalNote = { title: "title-equal", content: "content-equal", tags: ["equal-tag"] };
      await secondAgent.post(route).send(equalNote);
      await agent.post(route).send(equalNote);
      const res = await agent.get(route).query({ tags: equalNote.tags });
      const body = noteRootGetResponseSchema.parse(res.body);
      expect(body.data).toHaveLength(1);
      const secondRes = await secondAgent.get(route).query({ tags: equalNote.tags });
      const secondBody = noteRootGetResponseSchema.parse(secondRes.body);
      expect(secondBody.data).toHaveLength(1);
    });
  });
});
