import type { MongoId } from "../../../types/primitives";
import type { ResetTokenSchemaType } from "./password-reset-token.model";

export type ResetTokenDomain = {
  userId: MongoId;
  validatorHash: string;
};

export type ResetTokenPersist = Pick<ResetTokenSchemaType, "userId" | "validatorHash">;
