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
});
