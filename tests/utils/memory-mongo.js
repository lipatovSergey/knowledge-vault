// tests/utils/memory-mongo.js
const { MongoMemoryServer } = require("mongodb-memory-server");
let mongo = null;

async function startMemoryMongo(opts = {}) {
  mongo = await MongoMemoryServer.create(opts);
  const uri = mongo.getUri(); // mongodb://127.0.0.1:<port>/test
  console.log("mongo.uri", uri);
  process.env.MONGO_URI = uri; // important! Before import of app / connect-mongo
}

async function stopMemoryMongo() {
  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
}

module.exports = { startMemoryMongo, stopMemoryMongo };
