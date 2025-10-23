const mongoose = require("mongoose");
const { MONGO_URI, MONGO_DB_NAME } = require("./env");

async function connectDB() {
  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });
  console.log("MongoDB connected");
}

module.exports = connectDB;
