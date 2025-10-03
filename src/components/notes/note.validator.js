const z = require("zod");

const schemas = {
	createNote: z.object({
		title: z
			.string()
			.trim()
			.min(1, "Title is required")
			.max(120, "Title max length 120 symbols"),
		content: z
			.string()
			.trim()
			.min(1, "Content is required")
			.max(2000, "Content max length 2000 symbols"),
	}),
};

module.exports = { schemas };
