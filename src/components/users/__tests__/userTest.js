const request = require("supertest");
const app = require("../../../app");

describe("User registration", () => {
	it("should register a new user", async () => {
		const res = await request(app).post("/api/users").send({
			name: "Test User",
			email: "test@example.com",
			password: "pass123",
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("message", "User created successfully");
	});
});
