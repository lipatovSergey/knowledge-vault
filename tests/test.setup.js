// tests/test.setup.js
jest.setTimeout(60_000); // first start need to download binary

process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const { startMemoryMongo, stopMemoryMongo } = require("./utils/memory-mongo.js");

let store; // connect-mongo store

beforeAll(async () => {
  // start in-memory Mongo and change process.env.MONGO_URI
  await startMemoryMongo();
  // only then import app 
  const app = require("../src/app");
  global.app = app;

  // if DB connect by function and not inside app
  try {
    const connectDB = require("../src/config/db");
    if (typeof connectDB === "function") {
      await connectDB();
    }
  } catch (_) {}

  // get store to close it in afterAll
  try {
    ({ store } = require("../src/middleware/session.middleware"));
  } catch (_) {}

  // check that connection succeed
  if(mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

afterEach(async () => {
  // clear all collections between tests
  if(!mongoose.connection?.db) return;
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  if(store && typeof store.close === "function") {
    await store.close();
  }
  await stopMemoryMongo();
});
