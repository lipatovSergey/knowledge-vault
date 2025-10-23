const config = require("config");

module.exports = {
  PORT: config.get("port"),
  MONGO_URI: config.get("db.uri"),
  MONGO_DB_NAME: config.get("db.name"),
  SESSION_SECRET: config.get("session_secret"),
  RESET_TOKEN_TTL_MS: config.get("auth.reset_token_ttl_ms"),
};
