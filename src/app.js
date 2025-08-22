const express = require("express");
const errorHandler = require("./middleware/error-handler.middleware");
const { NODE_ENV } = require("./config/env");

const app = express();
app.use(express.json());

console.log(`server running in ${NODE_ENV} mode`);
// session
const { sessionMiddleware } = require("./middleware/session.middleware");
app.use(sessionMiddleware);

// note routes connection
const noteRoutes = require("./components/notes/note.routes");
app.use("/api/notes", noteRoutes);

// user routes connection
const userRoutes = require("./components/users/user.routes");
app.use("/api/users", userRoutes);

const authRoutes = require("./components/auth/auth.routes.js");
app.use("/api/auth", authRoutes);

// test routes
if (NODE_ENV === "test") {
  const testRoutes = require("../tests/test.routes.js");
  app.use("/test", testRoutes);
}

app.use(errorHandler);

module.exports = app;
