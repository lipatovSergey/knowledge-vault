import type { MongoId, PasswordResetSelector } from "../../../types/primitives";
import type { ResetTokenSchemaType } from "./password-reset-token.model";

export type ResetRequestRecord = {
  userId: MongoId;
  validatorHash: string;
};

export type CreateTokenInput = {
  selector: PasswordResetSelector;
  validatorHash: string;
  expiresAt: Date;
  userId: MongoId;
};

export type ResetTokenPersist = Pick<ResetTokenSchemaType, "userId" | "validatorHash">;
