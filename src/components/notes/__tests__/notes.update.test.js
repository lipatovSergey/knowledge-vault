const request = require("supertest");
const it = global.it;
const { Types } = require("mongoose");

describe("PATCH /api/notes/:id", () => {
  let route;
  let agent;
  let noteId;
  const title = "valid-title";
  const content = "valid-content";

  beforeEach(async () => {
    agent = request.agent(global.app);
    await agent.post("/api/users").send({
      name: "User",
      email: "test@example.com",
      password: "pass123",
    });
    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "pass123",
    });
    const res = await agent.post("/api/notes").send({
      title: title,
      content: content,
    });
    noteId = res.body.id;
    route = `/api/notes/${noteId}`;
  });

  it("should update note's title in DB, returns 200 and updated note", async () => {
    const changedTitle = "changed-valid-title";
    const res = await agent.patch(route).send({
      title: changedTitle,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title", changedTitle);
  });

  it("should update note's content in DB, returns 200 and updated note", async () => {
    const changedContent = "changed-valid-content";
    const res = await agent.patch(route).send({
      content: changedContent,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("content", changedContent);
  });

  it("returns 404 status code if note wasn't found in DB", async () => {
    const missingId = new Types.ObjectId().toString();
    const res = await agent.patch(`/api/notes/${missingId}`).send({
      title: "changed-title",
    });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Note not found");
  });

  it("returns 404 status code if request send not by note's owner", async () => {
    // create new user with separate agent
    const intrudetAgent = request.agent(global.app);
    await intrudetAgent.post("/api/users").send({
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
    expect(res.body).toHaveProperty("message", "Note not found");
  });

  it("returns 401 status code if request was send by not authorized user", async () => {
    const res = await request(global.app).patch(route);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });

  it("returns 401 status code if user logged out before request send", async () => {
    await agent.post("/api/auth/logout");
    const res = await agent.patch(route);
    console.log(res.errors);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });
});
