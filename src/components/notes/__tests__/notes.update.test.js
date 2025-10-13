const request = require("supertest");
const it = global.it;

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
});
