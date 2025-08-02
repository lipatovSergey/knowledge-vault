const express = require("express");
const errorHandler = require("./middleware/error-handler.middleware");

const app = express();
app.use(express.json());

// session
const { sessionMiddleware } = require("./middleware/session.middleware");
app.use(sessionMiddleware);

// note routes connection
const noteRoutes = require("./components/notes/note.routes");
app.use("/api/notes", noteRoutes);

// user routes connection
const userRoutes = require("./components/users/user.routes");
app.use("/api/users", userRoutes);
app.get("/test-error", (req, res) => {
	throw new Error("Simulated unexpected error");
});
app.use(errorHandler);

module.exports = app;
