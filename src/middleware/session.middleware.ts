// src/middleware/session.middleware
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import { SESSION_SECRET } from "../config/env";
import { getMongoUri } from "../utils/get-mongo-uri.helper";

let store: session.Store;
const MONGO_URI = getMongoUri();
if (process.env.NODE_ENV === "test") {
  // MemoryStore for tests, no clients
  store = new session.MemoryStore();
} else {
  // DEV/PROD mode
  // Check if mongoose client already exists
  const client = mongoose.connection?.readyState === 1 ? mongoose.connection.getClient() : null;

  const baseOptions = { collectionName: "sessions", ttl: 60 * 60 * 24 }; // 1 day
  if (client) {
    // if mongoose client exists use it for sessions store as well
    store = MongoStore.create({ client, ...baseOptions });
  } else {
    // else create another client for sessions
    store = MongoStore.create({ mongoUrl: MONGO_URI, ...baseOptions });
    // throw warn. Need to check order of DB connect and session middleware
    console.warn("Session store initialized before DB connection");
  }
}

const production = process.env.NODE_ENV === "production";
// secure=false for tests so that SuperTest sees cookies without HTTPS
export const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    sameSite: production ? "none" : "lax",
    secure: production,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
});

export { store };
