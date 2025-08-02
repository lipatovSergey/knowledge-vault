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
	it("should return 400 if name was not passed", async () => {
		const res = await request(app).post("/api/users").send({
			name: "",
			email: "test1@example.com",
			password: "pass123",
		});
		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Validation Failed");
		expect(res.body.errors).toHaveProperty("name");
		expect(res.body.errors.name[0]).toBe("Name is required");
	});
	it("should return 400 if email is invalid or empty string", async () => {
		const res = await request(app).post("/api/users").send({
			name: "name",
			email: "test",
			password: "pass123",
		});
		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Validation Failed");
		expect(res.body.errors).toHaveProperty("email");
		expect(res.body.errors.email[0]).toBe("Invalid email");
	});
});
