const request = require("supertest");
const it = global.it;
const { Types } = require("mongoose");
const {
  createExpectUnauthorizedError,
  createExpectBadRequestError,
  createExpectNotFoundError,
} = require("../../../../tests/helpers/expect-problem.factories.js");

describe("GET /api/note/:id", () => {
  let route;
  let agent;
  let noteId;
  let expectNotFoundError;
  let expectUnauthorizedError;

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
    expectNotFoundError = createExpectNotFoundError(route);
    expectUnauthorizedError = createExpectUnauthorizedError(route);
  });

  it("return 200 status code and plain note object with id, title, content, createdAt, updatedAt fields", async () => {
    const res = await agent.get(route);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: noteId,
        title: "valid-title",
        content: "valid-content",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
    expect(Object.keys(res.body).sort()).toEqual(
      ["id", "title", "content", "createdAt", "updatedAt"].sort(),
    );
  });

  it("returns 400 status code if passed note id invalid", async () => {
    const route = "/api/note/12345678";
    const expectBadRequestError = createExpectBadRequestError(route);
    const res = await agent.get(route);
    expectBadRequestError(res);
  });

  it("returns 404 status code if note wasn't found in DB", async () => {
    const missingId = new Types.ObjectId().toString();
    expectNotFoundError = createExpectNotFoundError(`/api/note/${missingId}`);
    const res = await agent.get(`/api/note/${missingId}`);
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

    const res = await intrudetAgent.get(route);
    expectNotFoundError(res);
  });

  it("returns 401 status code if request was send by not authorized user", async () => {
    const res = await request(global.app).get(route);
    expectUnauthorizedError(res);
  });

  it("returns 401 status code if user logged out before request send", async () => {
    await agent.post("/api/auth/logout");
    const res = await agent.get(route);
    expectUnauthorizedError(res);
  });
});
