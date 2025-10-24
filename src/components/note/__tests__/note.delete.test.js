const request = require("supertest");
const { Types } = require("mongoose");
const {
  createExpectUnauthorizedError,
  createExpectBadRequestError,
  createExpectNotFoundError,
} = require("../../../../tests/helpers/expect-problem.factories.js");

describe("DELETE /api/note/:id", () => {
  let route;
  let agent;
  let noteId;

  let expectUnauthorizedError;
  let expectNotFoundError;

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
    expectUnauthorizedError = createExpectUnauthorizedError(route);
    expectNotFoundError = createExpectNotFoundError(route);
  });

  it("Deletes note from DB returns 200 status code", async () => {
    const res = await agent.delete(route);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Note deleted");
  });

  it("returns 400 status code if passed note id invalid", async () => {
    route = "/api/note/12345678";
    const expectBadRequestError = createExpectBadRequestError(route);
    const res = await agent.delete(route);
    expectBadRequestError(res);
    expect(res.body).toHaveProperty("detail", "Invalid ObjectId");
  });

  it("returns 404 status code if delete request was send twice", async () => {
    await agent.delete(route);
    const res = await agent.delete(route);
    expectNotFoundError(res);
  });

  it("returns 404 status code to get /api/note/:id after successful note delete", async () => {
    await agent.delete(route);
    const res = await agent.get(route);
    expectNotFoundError(res);
  });

  it("returns 404 status code if note wasn't found in DB", async () => {
    const missingId = new Types.ObjectId().toString();
    expectNotFoundError = createExpectNotFoundError(`/api/note/${missingId}`);
    const res = await agent.delete(`/api/note/${missingId}`);
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

    const res = await intrudetAgent.delete(route);
    expectNotFoundError(res);
  });

  it("returns 401 status code if request was send by not authorized user", async () => {
    const res = await request(global.app).delete(route);
    expectUnauthorizedError(res);
  });

  it("returns 401 status code if user logged out before request send", async () => {
    await agent.post("/api/auth/logout");
    const res = await agent.delete(route);
    expectUnauthorizedError(res);
  });
});
