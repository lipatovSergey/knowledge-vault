const request = require("supertest");
const app = require("../../../app");
const it = global.it;

describe("User login", () => {
	const route = "/api/users/login";
	beforeEach(async () => {
		await request(app).post("/api/users").send({
			name: "User",
			email: "test@example.com",
			password: "pass123",
		});
	});

	it("should log in with correct credentials", async () => {
		const res = await request(app).post(route).send({
			email: "test@example.com",
			password: "pass123",
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("message", "Login successful");
	});

	it("should set session cookie after successful login", async () => {
		const res = await request(app).post(route).send({
			email: "test@example.com",
			password: "pass123",
		});
		expect(res.status).toBe(200);
		expect(res.headers["set-cookie"]).toBeDefined();
		expect(res.headers["set-cookie"][0]).toMatch(/connect\.sid=/);
	});

	it("should return 401 if email is incorrect", async () => {
		const res = await request(app).post(route).send({
			email: "wrong@example.com",
			password: "pass123",
		});
		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid email or password");
	});

	it("should return 401 if password is incorrect", async () => {
		const res = await request(app).post(route).send({
			email: "test@example.com",
			password: "pass124",
		});
		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid email or password");
	});

	it("should return 400 if email is an empty string", async () => {
		const res = await request(app).post(route).send({
			email: "",
			password: "pass123",
		});
		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Validation Failed");
		expect(res.body.errors).toHaveProperty("email");
		expect(res.body.errors.email[0]).toBe("Email is required");
	});

	it("should return 400 if password is an empty string", async () => {
		const res = await request(app).post(route).send({
			email: "test@example.com",
			password: "",
		});
		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Validation Failed");
		expect(res.body.errors).toHaveProperty("password");
		expect(res.body.errors.password[0]).toBe("Password is required");
	});
});
