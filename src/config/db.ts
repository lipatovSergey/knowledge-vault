import mongoose from "mongoose";
import { MONGO_DB_NAME } from "./env";
import { getMongoUri } from "../utils/get-mongo-uri.helper";

async function connectDB(): Promise<void> {
  const MONGO_URI = getMongoUri();
  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });
  console.log("MongoDB connected");
}

export default connectDB;
