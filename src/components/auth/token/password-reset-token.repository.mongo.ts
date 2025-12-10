import type { MongoId, PasswordResetSelector } from "../../../types/primitives";
import { mapPersistRecordToDomain } from "./password-reset-token.mapper";
import { ResetTokenModel } from "./password-reset-token.model";
import type {
  CreateTokenInput,
  ResetRequestRecord,
  ResetTokenPersist,
} from "./password-reset-token.types";

const resetTokenRepo = {
  // saves new token to MongoDB and return it
  async create(resetTokenData: CreateTokenInput): Promise<void> {
    await new ResetTokenModel(resetTokenData).save();
  },

  async findActiveBySelector(selector: PasswordResetSelector): Promise<ResetRequestRecord | null> {
    const token = await ResetTokenModel.findOne({ selector })
      .active()
      .select({ userId: 1, validatorHash: 1 })
      .lean<ResetTokenPersist>();
    return token ? mapPersistRecordToDomain(token) : null;
  },

  async consumeBySelector(selector: string): Promise<boolean> {
    const doc = await ResetTokenModel.findOneAndUpdate(
      { selector },
      { $set: { usedAt: new Date() } },
      { returnDocument: "after" },
    )
      .active()
      .exec();
    return !!doc;
  },

  async removeAllForUser(userId: MongoId): Promise<number> {
    const res = await ResetTokenModel.deleteMany({ userId }).exec();
    return res.deletedCount ?? 0;
  },
};

export type ResetTokenRepositoryType = typeof resetTokenRepo;
export default resetTokenRepo;
