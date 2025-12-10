import mongoose from "mongoose";
import { getMongoUri } from "../utils/get-mongo-uri.helper";
import { MONGO_DB_NAME } from "./env";

async function connectDB(): Promise<void> {
  const MONGO_URI = getMongoUri();
  await mongoose.connect(MONGO_URI, {
    dbName: MONGO_DB_NAME,
    autoIndex: process.env.NODE_ENV !== "production",
  });
  console.log("MongoDB connected");
}

export default connectDB;
