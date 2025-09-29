const z = require("zod");

const schemas = {
	passwordForgot: z.object({
		email: z.string().email("Invalid email"),
	}),
	passwordResetToken: z.object({
		token: z
			.string()
			.regex(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, "Invalid token format"),
	}),
	passwordResetPasswords: z
		.object({
			newPassword: z.string().min(6, "Password must be at least 6 characters"),
			newPasswordConfirmation: z
				.string()
				.min(6, "Password must be at least 6 characters"),
		})
		.refine(data => data.newPassword === data.newPasswordConfirmation, {
			message: "Passwords do not match",
		}),
};

module.exports = {
	schemas,
};
