import { Types } from "mongoose";
import { ResetTokenModel } from "./password-reset-token.model";
import type { ResetTokenSchemaType } from "./password-reset-token.model";
import type { MongoId } from "../../../types/mongo";

type LeanActiveToken = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  validatorHash: string;
};

type CreateTokenData = Pick<
  ResetTokenSchemaType,
  "selector" | "validatorHash" | "expiresAt"
> & { userId: MongoId };

const resetTokenRepo = {
  // saves new token to MongoDB and return it
  async create(resetTokenData: CreateTokenData): Promise<void> {
    await new ResetTokenModel(resetTokenData).save();
  },

  async findActiveBySelector(
    selector: string,
  ): Promise<LeanActiveToken | null> {
    return ResetTokenModel.findOne({ selector })
      .active()
      .select("_id userId +validatorHash")
      .lean<LeanActiveToken>()
      .exec();
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
