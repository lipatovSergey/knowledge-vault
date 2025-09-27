const mongoose = require("mongoose");
const resetTokenRepo = require("../../src/components/auth/token/password-reset-token.repository.mongo.js");

async function createExpiredResetToken({ userId, selector, validatorHash }) {
	return resetTokenRepo.create({
		selector: selector || "expired-selector",
		validatorHash: validatorHash || "expired-validator-hash",
		userId: userId || new mongoose.Types.ObjectId(),
		expiresAt: new Date(Date.now() - 1000),
	});
}

module.exports = {
	createExpiredResetToken,
};
