const z = require("zod");

const userCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

const userLoginSchema = z.object({
	email: z.string().min(1, "Email is required"),
	password: z.string().min(1, "Password is required"),
});

module.exports = {
	userCreateSchema,
	userLoginSchema,
};
