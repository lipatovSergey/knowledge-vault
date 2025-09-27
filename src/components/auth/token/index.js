const {
	createResetTokenService,
} = require("./password-reset-token.service.js");
const resetTokenRepo = require("./password-reset-token.repository.mongo.js");
const bcrypt = require("bcrypt");
const { random } = require("../../../utils/random.util.js");
const { RESET_TOKEN_TTL_MS } = require("../../../config/env.js");
const { now } = require("../../../utils/clock.js");

const tokenService = createResetTokenService({
	resetTokenRepo,
	bcrypt,
	random,
	ttlMs: RESET_TOKEN_TTL_MS,
	now,
});

module.exports = { tokenService };
