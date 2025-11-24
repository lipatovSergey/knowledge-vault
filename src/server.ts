import "dotenv/config";
import { PORT } from "./config/env";
import connectDB from "./config/db";

// Global errors catchers
// Catch and any promise rejections that were never awaited/caugh
process.on("unhandledRejection", (reason) => {
  // TODO: Winston logger
  console.error("Unhandled promise rejection", reason);
});

// Log unexpected synchronous errors and rethrow so the process terminates instead of ignoring the failure.
process.on("uncaughtException", (err) => {
  // TODO: Winston logger
  console.error("uncaught synchronous error", err);
});

// MongoDB connection
connectDB()
  .then(() => {
    import("./app").then(({ default: app }) => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}.`);
      });
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error", error);
  });
