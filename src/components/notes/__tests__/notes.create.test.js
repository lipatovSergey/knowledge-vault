const request = require("supertest");
const it = global.it;

describe("/api/notes/", () => {
	const route = "/api/notes";
	let agent;

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
	});

	it("should create new note for user and return mapped object", async () => {
		const note = {
			title: "some-test-title",
			content: "some-test-content",
		};
		const res = await agent
			.post(route)
			.send({ title: note.title, content: note.content });

		expect(res.statusCode).toBe(201);

		expect(res.body).toEqual(
			expect.objectContaining({
				id: expect.any(String),
				title: note.title,
				content: note.content,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			})
		);

		expect(Object.keys(res.body).sort()).toEqual(
			["id", "title", "content", "createdAt", "updatedAt"].sort()
		);

		//TODO: check if note was created with get /api/notes/:id
	});

	it.each([
		["title", { title: "", content: "valid-content" }],
		["content", { title: "valid-title", content: "" }],
	])(
		"should throw 400 error if empty %s was passed in note data",
		async (_, invalidData) => {
			const res = await agent.post(route).send(invalidData);
			expect(res.statusCode).toBe(400);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: expect.any(String),
					errors: expect.any(Object),
				})
			);
		}
	);

	it.each([
		["title", { content: "valid-content" }],
		["content", { title: "valid-title" }],
	])(
		"should throw 400 error if %s was not passed in note data",
		async (_, invalidData) => {
			const res = await agent.post(route).send(invalidData);
			expect(res.statusCode).toBe(400);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: expect.any(String),
					errors: expect.any(Object),
				})
			);
		}
	);

	it("throws 401 error if user not authorized", async () => {
		const noteData = { title: "valid-title", content: "valid-content" };
		const res = await request(global.app).post(route).send(noteData);
		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message");
	});

	it("throws 400 error if title longer then 120 symbols", async () => {
		const noteData = { title: "a".repeat(121), content: "valid-content" };
		const res = await agent.post(route).send(noteData);
		expect(res.statusCode).toBe(400);
		expect(res.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
				errors: expect.any(Object),
			})
		);
	});

	it("throws 400 error if content longer then 2000 symbols", async () => {
		const noteData = { title: "valid-title", content: "a".repeat(2001) };
		const res = await agent.post(route).send(noteData);
		expect(res.statusCode).toBe(400);
		expect(res.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
				errors: expect.any(Object),
			})
		);
	});
});
