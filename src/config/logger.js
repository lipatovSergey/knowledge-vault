const { createLogger, format, transports } = require("winston");

const prettyFormat = format.printf(({ timestamp, level, message, ...meta }) => {
	const metaString = Object.entries(meta)
		.map(([key, value]) => `${key}: ${JSON.stringify(value, null, 2)}`)
		.join("\n");

	return `[${timestamp}] ${level.toUpperCase()}: ${message}\n${metaString}\n`;
});

const logger = createLogger({
	level: "info",
	format: format.combine(
		format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		format.errors({ stack: true }),
		prettyFormat
	),
	transports: [
		new transports.Console(),
		new transports.File({ filename: "logs/error.log", level: "error" }),
		new transports.File({ filename: "logs/combined.log" }),
	],
});

module.exports = logger;
