import mongoose from "mongoose";
import { MONGO_URI, MONGO_DB_NAME } from "./env";

async function connectDB(): Promise<void> {
  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });
  console.log("MongoDB connected");
}

export default connectDB;
