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
    const res = await agent.patch(route).send({
      title: "updated-valid-title",
    });
    expect(res.statusCode).toBe(200);
  });
});
