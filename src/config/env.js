const config = require("config");

module.exports = {
  PORT: config.get("port"),
  MONGO_URI: config.get("db.uri"),
  SESSION_SECRET: config.get("session_secret"),
  NODE_ENV: config.get("node_env"),
  FRONTEND_URL: config.get("frontend.url"),
  RESET_TOKEN_TTL_MS: config.get("auth.reset_token_ttl_ms"),
};
