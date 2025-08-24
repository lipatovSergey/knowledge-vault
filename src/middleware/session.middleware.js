// src/middleware/session.middleware.js
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const { SESSION_SECRET, MONGO_URI } = require("../config/env");

const isTest = process.env.NODE_ENV === "test";

// 1) В тестах используем MemoryStore — никаких отдельных Mongo-клиентов.
let store;
if (isTest) {
  store = new session.MemoryStore();
} else {
  // 2) В обычном режиме привязываем store к КЛИЕНТУ Mongoose (а не к mongoUrl),
  //    чтобы у Mongoose и connect-mongo был один и тот же MongoClient.
  //    Если по какой-то причине клиент ещё не готов — мягко упадём на mongoUrl.
  const client =
    mongoose.connection?.readyState === 1
      ? mongoose.connection.getClient()
      : null;

  const baseOptions = { collectionName: "sessions", ttl: 60 * 60 * 24 }; // 1 сутки
  store = MongoStore.create(
    client ? { client, ...baseOptions } : { mongoUrl: MONGO_URI, ...baseOptions }
  );
}

// 3) Сам middleware с безопасными настройками cookie.
//    В тестах secure=false — чтобы SuperTest видел куку без HTTPS.
const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // включите true в проде за HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 1 сутки
  },
});

module.exports = { sessionMiddleware, store };

