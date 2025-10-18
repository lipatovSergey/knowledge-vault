const request = require("supertest");
const it = global.it;

describe("User login", () => {
  const route = "/api/auth/login";
  beforeEach(async () => {
    await request(global.app).post("/api/users").send({
      name: "User",
      email: "test@example.com",
      password: "pass123",
    });
  });

  it("should log in with correct credentials", async () => {
    const res = await request(global.app).post(route).send({
      email: "test@example.com",
      password: "pass123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Login successful");
  });

  it("should set session cookie after successful login", async () => {
    const res = await request(global.app).post(route).send({
      email: "test@example.com",
      password: "pass123",
    });
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toMatch(/connect\.sid=/);
  });

  it("regenerates session ID on successful login", async () => {
    const agent = request.agent(global.app);
    // create guest session
    const touchRes = await agent.get("/test/touch");
    expect(touchRes.status).toBe(200);
    const cookieBefore = touchRes.headers["set-cookie"][0];
    expect(cookieBefore).toMatch(/connect\.sid=/);

    // login with the same agent
    const loginRes = await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "pass123",
    });
    expect(loginRes.status).toBe(200);
    const cookieAfter = loginRes.headers["set-cookie"][0];
    expect(cookieAfter).toMatch(/connect\.sid=/);

    // compare sessions ids
    const sidBefore = cookieBefore.match(/connect\.sid=([^;]+)/)[1];
    const sidAfter = cookieAfter.match(/connect\.sid=([^;]+)/)[1];
    expect(sidBefore).not.toBe(sidAfter);
  });

  it("should return 401 if email is incorrect", async () => {
    const res = await request(global.app).post(route).send({
      email: "wrong@example.com",
      password: "pass123",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({
      title: "Unauthorized",
      detail: "Invalid email or password",
      status: 401,
      type: "urn:problem:unauthorized",
      instance: "/api/auth/login",
    });
  });

  it("should return 401 if password is incorrect", async () => {
    const res = await request(global.app).post(route).send({
      email: "test@example.com",
      password: "pass124",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({
      title: "Unauthorized",
      detail: "Invalid email or password",
      status: 401,
      type: "urn:problem:unauthorized",
      instance: "/api/auth/login",
    });
  });

  it("should return 422 if email is an empty string", async () => {
    const res = await request(global.app).post(route).send({
      email: "",
      password: "pass123",
    });
    expect(res.body).toMatchObject({
      title: "Validation failed",
      status: 422,
      type: "urn:problem:validation-error",
      instance: "/api/auth/login",
      errors: { source: "body" },
    });
    expect(res.body.errors.fieldErrors).toHaveProperty("email");
  });

  it("should return 422 if password is an empty string", async () => {
    const res = await request(global.app).post(route).send({
      email: "test@example.com",
      password: "",
    });
    expect(res.body).toMatchObject({
      title: "Validation failed",
      status: 422,
      type: "urn:problem:validation-error",
      instance: "/api/auth/login",
      errors: { source: "body" },
    });
    expect(res.body.errors.fieldErrors).toHaveProperty("password");
  });

  it("should return 409 if user is already logged in", async () => {
    const firstRes = await request(global.app).post(route).send({
      email: "test@example.com",
      password: "pass123",
    });

    const cookie = firstRes.headers["set-cookie"];

    const res = await request(global.app)
      .post(route)
      .set("Cookie", cookie)
      .send({
        email: "test@example.com",
        password: "pass123",
      });
    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({
      title: "Conflict",
      detail: "Conflict",
      status: 409,
      type: "urn:problem:conflict",
      instance: "/api/auth/login",
    });
  });
});
