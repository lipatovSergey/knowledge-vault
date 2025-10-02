require("dotenv").config();
const { PORT } = require("./config/env");
const connectDB = require("./config/db");

// Global errors catchers
// Catch and any promise rejections that were never awaited/caugh
process.on("unhandledRejection", reason => {
	logger.error("Unhandled promise rejection", {
		event: "unhandledRejection",
		reason,
	});
	throw reason instanceof Error ? reason : new Error(String(reason));
});

// Log unexpected synchronous errors and rethrow so the process terminates instead of ignoring the failure.
process.on("uncaughtException", err => {
	logger.error("uncauth synchronous error", {
		event: "uncaughtException",
		reason,
	});
	throw err;
});

// MongoDB connection
connectDB()
	.then(() => {
		const app = require("./app");
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch(error => {
		console.error("MongoDB connection error", error);
	});
