const request = require("supertest");
const app = require("../../../app");

describe("User registration", () => {
	describe("Validation errors", () => {
		function expectValidationError(res) {
			expect(res.statusCode).toBe(400);
			expect(res.body).toHaveProperty("message", "Validation Failed");
		}
		it("should return 400 and errors for invalid types of fields", async () => {
			const res = await request(app).post("/api/users").send({
				name: 123,
				email: 123,
				password: 123,
			});
			expectValidationError(res);
			expect(res.body.errors).toMatchObject({
				name: ["Invalid input: expected string, received number"],
				email: ["Invalid input: expected string, received number"],
				password: ["Invalid input: expected string, received number"],
			});
		});
		it("should return 400 if name was not passed", async () => {
			const res = await request(app).post("/api/users").send({
				name: "",
				email: "test1@example.com",
				password: "pass123",
			});
			expectValidationError(res);
			expect(res.body.errors).toHaveProperty("name");
			expect(res.body.errors.name[0]).toBe("Name is required");
		});
		it("should return code 400 and message 'Invalid email' if email is invalid or empty string", async () => {
			const res = await request(app).post("/api/users").send({
				name: "name",
				email: "test",
				password: "pass123",
			});
			expectValidationError(res);
			expect(res.body.errors).toHaveProperty("email");
			expect(res.body.errors.email[0]).toBe("Invalid email");
		});
		it("should return code 400 and message 'Password must be at least 6 characters'	if password is invalid or empty string", async () => {
			const res = await request(app).post("/api/users").send({
				name: "name",
				email: "test@test.com",
				password: "",
			});
			expectValidationError(res);
			expect(res.body.errors).toHaveProperty("password");
			expect(res.body.errors.password[0]).toBe(
				"Password must be at least 6 characters"
			);
		});
	});
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
