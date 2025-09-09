const mongoose = require("mongoose");

const resetTokenSchema = new mongoose.Schema(
  {
    // TODO: add format for selector
    selector: {
      type: String,
      unique: true,
      required: true,
    },
    validatorHash: {
      type: String,
      required: true,
      select: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
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
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    strict: "throw",
    toJSON: {
      virtuals: true,
      getters: true,
      transform(_doc, ret) {
        delete ret.__v;
        delete ret.validatorHash;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
    },
  },
);

// vitrtual to check if token expired
resetTokenSchema.virtual("isExpired").get(function () {
  return this.expiresAt <= new Date();
});

// query helpers
resetTokenSchema.query.active = function () {
  return this.where({
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });
};

// indexes
// Date.now() > expiresAt, wait 0 seconds and delete
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// fast delete all user's active tokens
resetTokenSchema.index({ userId: 1 });

const ResetToken = mongoose.model("ResetToken", resetTokenSchema);
module.exports = ResetToken;
