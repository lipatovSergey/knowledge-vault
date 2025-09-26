function createResetTokenService({
	resetTokenRepo,
	bcrypt,
	random,
	ttlMs,
	now,
}) {
	return {
		async createTokenForUser(userId) {
			const selector = (await random(16)).toString("base64url");
			const validator = (await random(32)).toString("base64url");
			const saltRounds = 10;
			const validatorHash = await bcrypt.hash(validator, saltRounds);
			await resetTokenRepo.create({
				selector,
				validatorHash,
				userId: userId,
				expiresAt: new Date(now() + ttlMs),
			});
			return `${selector}.${validator}`;
		},
		async verifyAndConsume(tokenPair) {},
		async removeAllForUser(userId) {},
	};
}

module.exports = { createResetTokenService };
