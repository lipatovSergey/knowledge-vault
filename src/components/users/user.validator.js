const z = require("zod");

const schemas = {
	userCreate: z.object({
		name: z.string().min(1, "Name is required"),
		email: z.string().email("Invalid email"),
		password: z.string().min(6, "Password must be at least 6 characters"),
	}),

	userInfoPatch: z.object({
		name: z.string().min(1, "Name is required"),
	}),
};

module.exports = {
	schemas,
};
