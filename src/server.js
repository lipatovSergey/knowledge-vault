require("dotenv").config();
const { PORT } = require("./config/env");
const connectDB = require("./config/db");

// Global errors catchers
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED PROMISE REJECTION:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

// MongoDB connection
connectDB()
  .then(() => {
    const app = require("./app");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error", error);
  });
