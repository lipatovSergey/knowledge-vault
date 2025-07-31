const config = require("config");

module.exports = {
	PORT: config.get("port"),
	MONGO_URI: config.get("db.uri"),
	SESSION_SECRET: config.get("session_secret"),
	NODE_ENV: config.get("node_env"),
};
