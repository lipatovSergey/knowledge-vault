const request = require("supertest");
const mailbox = require("../../../../tests/mailbox.helper.js");

describe("POST /api/auth/password/forgot", () => {
	const route = "/api/auth/password/forgot";
	const email = "test@example.com";
	let agent;

	beforeEach(async () => {
		mailbox.clear();
		agent = request.agent(global.app);
		await agent.post("/api/users").send({
			name: "User",
			email: email,
			password: "pass123",
		});
	});

	it("drops a reset email into the mailbox for existing user", async () => {
		const res = await agent.post(route).send({ email });
		expect(res.statusCode).toBe(204);

		const msg = mailbox.lastTo(email);
		expect(msg).toBeDefined();
		expect(msg.type).toBe("password-reset");
	});

	it("returns 204 with a neutral message", async () => {
		const res = await agent.post(route).send({ email });
		expect(res.statusCode).toBe(204);
	});

	it("returns 400 on invalid email format", async () => {
		const res = await agent.post(route).send({ email: "invalid" });
		expect(res.statusCode).toBe(400);
		expect(res.body.errors).toHaveProperty("email");
	});

	it("includes a raw token in the reset email meta", async () => {
		await agent.post(route).send({ email: email });
		const msg = mailbox.lastTo(email);
		expect(msg).toBeDefined();
		expect(msg.meta?.rawToken).toBeDefined();
	});

	it("returns 204 even if there no user with passed email in DB", async () => {
		const res = await agent.post(route).send({ email: "notdbemail@gmail.com" });
		expect(res.statusCode).toBe(204);
	});

	it("if user sends request twice new token replace the old one", async () => {
		await agent.post(route).send({ email });
		const oldToken = mailbox.lastTo(email).meta.rawToken;
		await agent.post(route).send({ email });
		const newToken = mailbox.lastTo(email).meta.rawToken;
		expect(oldToken).not.toEqual(newToken);
	});
});
