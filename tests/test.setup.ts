import type { Collection } from "mongoose";
jest.setTimeout(60_000); // first start need to download binary

// Ensure the app runs in the expected mode even when tests aren’t launched via the npm scripts.
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const {
  startMemoryMongo,
  stopMemoryMongo,
} = require("./utils/memory-mongo.js");

beforeAll(async () => {
  const { default: connectDB } = await import("../src/config/db");
  await connectDB();
  // start in-memory Mongo and change process.env.MONGO_URI
  await startMemoryMongo();

  await connectDB();

  const { default: app } = await import("../src/app");
  global.app = app;
});

afterEach(async () => {
  // clear all collections between tests
  if (!mongoose.connection?.db) return;
  const collections: Collection[] = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await stopMemoryMongo();
});
