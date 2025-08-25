// src/middleware/session.middleware.js
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const { SESSION_SECRET, MONGO_URI } = require("../config/env");

let store;
if (process.env.NODE_ENV === "test") {
  // MemoryStore for tests, no clients
  store = new session.MemoryStore();
} else {
  // DEV/PROD mode
  // Check if mongoose client allready exists
  const client =
    mongoose.connection?.readyState === 1
      ? mongoose.connection.getClient()
      : null;

  const baseOptions = { collectionName: "sessions", ttl: 60 * 60 * 24 }; // 1 day
  if(client) {
    // if mongoose client exists use it for sessions store as well
    store = MongoStore.create({client, ...baseOptions})
  } else {
    // else create another client for sessions
    store = MongoStore.create({ mongoUrl: MONGO_URI, ...baseOptions })
    // throw warn. Need to check order of DB connect and session middleware
    console.warn("Session store initialized before DB connection")
  }
}

// secure=fase so that SuperTest sees cookies without HTTPS
const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // TODO: true in production 
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
});

module.exports = { sessionMiddleware, store };

