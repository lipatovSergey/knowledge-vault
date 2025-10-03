const request = require("supertest");
const it = global.it;

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
			})
		);
		expect(Object.keys(res.body).sort()).toEqual(
			["id", "title", "content", "createdAt", "updatedAt"].sort()
		);
	});
});
