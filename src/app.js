const express = require("express");
const errorHandler = require("./middleware/error-handler.middleware");
const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  throw new Error("NODE_ENV is not set. Use npm scripts to run the app");
}

const app = express();
app.use(express.json());

console.log(`Server running in ${NODE_ENV} mode.`);
// session
const { sessionMiddleware } = require("./middleware/session.middleware");
app.use(sessionMiddleware);

// note routes connection
const noteRoutes = require("./components/note/note.routes");
app.use("/api/note", noteRoutes);

// user routes connection
const userRoutes = require("./components/users/user.routes");
app.use("/api/user", userRoutes);

const authRoutes = require("./components/auth/auth.routes.js");
app.use("/api/auth", authRoutes);

// test routes
if (NODE_ENV === "test") {
  const testRoutes = require("../tests/test.routes.js");
  app.use("/test", testRoutes);
}

app.use(errorHandler);

module.exports = app;
