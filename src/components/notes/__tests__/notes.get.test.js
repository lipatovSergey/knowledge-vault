const request = require("supertest");
const it = global.it;
const { Types } = require("mongoose");

describe("GET /api/notes/:id", () => {
  let route;
  let agent;
  let noteId;

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
      title: "valid-title",
      content: "valid-content",
    });
    noteId = res.body.id;
    route = `/api/notes/${noteId}`;
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
    const res = await agent.get("/api/notes/12345678");
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("errors.id");
  });

  it("returns 404 status code if note wasn't found in DB", async () => {
    const missingId = new Types.ObjectId().toString();
    const res = await agent.get(`/api/notes/${missingId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Note not found");
  });

  it("returns 403 status code if request send not by note's owner", async () => {
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

    const res = await intrudetAgent.get(route);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Note not found");
  });

  it("returns 401 status code if request was send by not authorized user", async () => {
    const res = await request(global.app).get(route);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });

  it("returns 401 status code if user logged out before request send", async () => {
    await agent.post("/api/auth/logout");
    const res = await agent.get(route);
    console.log(res.errors);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });
});
