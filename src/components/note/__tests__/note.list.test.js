const request = require("supertest");
const it = global.it;
const {
  createExpectUnauthorizedError,
} = require("../../../../tests/helpers/expect-problem.factories.js");

describe("GET /api/note", () => {
  let agent;
  const route = "/api/note";
  const validNotesList = [
    {
      title: "valid-title",
      content: "valid-content",
    },
    {
      title: "valid-title-1",
      content: "valid-content-1",
    },
    {
      title: "valid-title-2",
      content: "valid-content-2",
    },
  ];
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
    await Promise.all(
      validNotesList.map((note) =>
        agent.post("/api/note").send({
          title: note.title,
          content: note.content,
        }),
      ),
    );
  });

  it("Get 200 status and array of all user's notes", async () => {
    const res = await agent.get(route);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining(
        validNotesList.map((note) =>
          expect.objectContaining({ title: note.title, content: note.content }),
        ),
      ),
    );
  });

  it("returns 401 if request was send by unauthorized user", async () => {
    const expectUnauthorizedError = createExpectUnauthorizedError(route);
    const res = await request(global.app).get(route);
    expectUnauthorizedError(res);
  });
});
