const config = require("config");

module.exports = {
	PORT: config.get("port"),
	MONGO_URI: config.get("db.uri"),
};
