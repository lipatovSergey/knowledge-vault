import { MongoMemoryServer } from "mongodb-memory-server";

type MongoMemoryServerOptions = Parameters<typeof MongoMemoryServer.create>[0];
let mongo: MongoMemoryServer | null = null;

export async function startMemoryMongo(opts?: MongoMemoryServerOptions) {
  mongo = await MongoMemoryServer.create(opts);
  const uri = mongo.getUri(); // mongodb://127.0.0.1:<port>/test
  process.env.MONGO_URI = uri; // important! Before import of app / connect-mongo
}

export async function stopMemoryMongo() {
  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
}
