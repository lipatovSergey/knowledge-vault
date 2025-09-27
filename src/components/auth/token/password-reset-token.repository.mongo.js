const ResetTokenModel = require("./password-reset-token.model.js");

const resetTokenRepo = {
	// saves new token to MongoDB and return it
	async create(resetTokenData) {
		const newResetToken = new ResetTokenModel(resetTokenData);
		return await newResetToken.save();
	},

	async findActiveBySelector(selector) {
		return ResetTokenModel.findOne({ selector })
			.active()
			.select("_id userId +validatorHash")
			.lean()
			.exec();
	},

	async consumeBySelector(selector) {
		const doc = await ResetTokenModel.findOneAndUpdate(
			{ selector },
			{ $set: { usedAt: new Date() } },
			{ returnDocument: "after" }
		)
			.active()
			.exec();
		return !!doc;
	},

	async removeAllForUser(userId) {
		const res = await ResetTokenModel.deleteMany({ userId }).exec();
		return res.deletedCount ?? 0;
	},
};

module.exports = resetTokenRepo;
