// tests/test.setup.js
jest.setTimeout(60_000); // first start need to download binary

process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const { startMemoryMongo, stopMemoryMongo } = require("./utils/memory-mongo.js");

let store; // connect-mongo store

beforeAll(async () => {
  // start in-memory Mongo and change process.env.MONGO_URI
  await startMemoryMongo();

  const connectDB = require("../src/config/db");
  await connectDB();

  const app = require("../src/app");
  global.app = app;

  // get store to close it in afterAll
 ({ store } = require("../src/middleware/session.middleware"));

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
  if(store && typeof store.close === "function") {
    try {
      await store.close()
    } catch (err) {
      if(err?.name !== "MongoClientClosedError") throw err; 
    }
  }
  await mongoose.disconnect()
  await stopMemoryMongo();
});
