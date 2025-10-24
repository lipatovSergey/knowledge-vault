const request = require("supertest");
const { Types } = require("mongoose");
const {
  createExpectUnauthorizedError,
  createExpectBadRequestError,
  createExpectNotFoundError,
  createExpectValidationError,
} = require("../../../../tests/helpers/expect-problem.factories.js");

describe("PATCH /api/note/:id", () => {
  let route;
  let agent;
  let noteId;
  const title = "valid-title";
  const content = "valid-content";

  let expectUnauthorizedError;
  let expectNotFoundError;
  let expectValidationError;
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
      title: title,
      content: content,
    });
    noteId = res.body.id;
    route = `/api/note/${noteId}`;
    expectValidationError = createExpectValidationError(route);
    expectNotFoundError = createExpectNotFoundError(route);
    expectUnauthorizedError = createExpectUnauthorizedError(route);
  });

  it("should update note's title in DB, returns 200 and updated note", async () => {
    const changedTitle = "changed-valid-title";
    const res = await agent.patch(route).send({
      title: changedTitle,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: noteId,
        title: changedTitle,
        content: content,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
    expect(Object.keys(res.body).sort()).toEqual(
      ["id", "title", "content", "createdAt", "updatedAt"].sort(),
    );
  });

  it("should update note's content in DB, returns 200 and updated note", async () => {
    const changedContent = "changed-valid-content";
    const res = await agent.patch(route).send({
      content: changedContent,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: noteId,
        title: title,
        content: changedContent,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
    expect(Object.keys(res.body).sort()).toEqual(
      ["id", "title", "content", "createdAt", "updatedAt"].sort(),
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
    expect(res.body).toEqual(
      expect.objectContaining({
        id: noteId,
        title: changedTitle,
        content: changedContent,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
    expect(Object.keys(res.body).sort()).toEqual(
      ["id", "title", "content", "createdAt", "updatedAt"].sort(),
    );
  });

  it("returns 400 status code if passed note id invalid", async () => {
    const fakeRoute = "/api/note/12345678";
    const expectBadRequestError = createExpectBadRequestError(fakeRoute);
    const res = await agent.patch(fakeRoute);
    expectBadRequestError(res);
  });

  it("return 422 if passed title empty string", async () => {
    const res = await agent.patch(route).send({
      title: "",
    });
    expectValidationError(res, ["title"], 1);
  });

  it("return 422 if passed title empty string", async () => {
    const res = await agent.patch(route).send({
      content: "",
    });
    expectValidationError(res, ["content"], 1);
  });

  it("returns 422 error if title longer then 120 symbols", async () => {
    const noteData = { title: "a".repeat(121) };
    const res = await agent.patch(route).send(noteData);
    expectValidationError(res, ["title"], 1);
  });

  it("returns 422 error if content longer then 2000 symbols", async () => {
    const noteData = { content: "a".repeat(2001) };
    const res = await agent.patch(route).send(noteData);
    expectValidationError(res, ["content"], 1);
  });

  it("returns 422 status code if passed empty body", async () => {
    const res = await agent.patch(route).send({});
    expectValidationError(res, [], 1);
  });

  it("returns 404 status code if note wasn't found in DB", async () => {
    const missingId = new Types.ObjectId().toString();
    const route = `/api/note/${missingId}`;
    expectNotFoundError = createExpectNotFoundError(route);
    const res = await agent.patch(route).send({
      title: "changed-title",
    });
    expectNotFoundError(res);
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
    expectNotFoundError(res);
  });

  it("returns 401 status code if request was send by not authorized user", async () => {
    const res = await request(global.app).patch(route);
    expectUnauthorizedError(res);
  });

  it("returns 401 status code if user logged out before request send", async () => {
    await agent.post("/api/auth/logout");
    const res = await agent.patch(route);
    expectUnauthorizedError(res);
  });
});
