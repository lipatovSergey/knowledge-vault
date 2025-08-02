const { SESSION_SECRET, MONGO_URI } = require("../config/env");
const MongoStore = require("connect-mongo");
const session = require("express-session");

const store = MongoStore.create({
	mongoUrl: MONGO_URI,
	collectionName: "sessions",
	ttl: 1000 * 60 * 60 * 24,
});

const sessionMiddleware = session({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store,
});

module.exports = { sessionMiddleware, store };
