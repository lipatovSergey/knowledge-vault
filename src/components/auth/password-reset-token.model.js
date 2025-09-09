const mongoose = require("mongoose");

const resetTokenSchema = new mongoose.Schema(
	{
		selector: {
			type: String,
			unique: true,
			required: true,
		},
		validatorHash: {},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			immutable: true,
		},

		tokenHash: {
			type: String,
			required: true,
			select: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			immutable: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{
		strict: "throw",
		toJSON: {
			virtuals: true,
			getters: true,
			transform(_doc, ret) {
				delete ret.__v;
				delete ret.tokenHash;
				return ret;
			},
		},
		toObject: {
			virtuals: true,
			getters: true,
		},
	}
);

/**

// виртуал удобен в тестах/логике
resetTokenSchema.virtual('isExpired').get(function () {
  return this.expiresAt <= new Date();
});

// статический метод: найти валидный токен
resetTokenSchema.statics.findValidByUserAndRawToken = async function (userId, rawToken, hmac) {
  const tokenHash = hmac(rawToken);         // HMAC-SHA256(secret, rawToken)
  return this.findOne({ userId, tokenHash, expiresAt: { $gt: new Date() } }).lean();
};

// статический метод: отозвать все токены пользователя
resetTokenSchema.statics.revokeAllForUser = function (userId) {
  return this.deleteMany({ userId });
};
 */

// indexes
// Date.now() > expiresAt, wait 0 seconds and delete
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
resetTokenSchema.index({ userId: 1, tokenHash: 1 });
resetTokenSchema.index({ userId: 1, expiresAt: -1 });

const ResetToken = mongoose.model("ResetToken", resetTokenSchema);
module.exports = ResetToken;
