import "dotenv/config";
import config from "config";

export const PORT = config.get<number>("port");
export const MONGO_URI = config.get<string>("db.uri");
export const MONGO_DB_NAME = config.get<string>("db.name");
export const SESSION_SECRET = config.get<string>("session_secret");
export const RESET_TOKEN_TTL_MS = config.get<number>("auth.reset_token_ttl_ms");
export const FRONTEND_URL = config.get<string>("fronted_url");
