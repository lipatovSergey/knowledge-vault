import express from "express";
import errorHandler from "./middleware/error-handler.middleware";
import { sessionMiddleware } from "./middleware/session.middleware";
import noteRoutes from "./components/note/note.routes";
import userRoutes from "./components/user/user.routes";
import authRoutes from "./components/auth/auth.routes";
const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  throw new Error("NODE_ENV is not set. Use npm scripts to run the app");
}

const app = express();
app.use(express.json());

console.log(`Server running in ${NODE_ENV} mode.`);
// secure cookies behind a proxy
if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
// session
app.use(sessionMiddleware);

// note routes connection
app.use("/api/note", noteRoutes);

// user routes connection
app.use("/api/user", userRoutes);

app.use("/api/auth", authRoutes);

// test routes
if (NODE_ENV === "test") {
  import("../tests/test.routes").then(({ default: testRoutes }) => {
    app.use("/test", testRoutes);
  });
}

app.use(errorHandler);

export default app;
