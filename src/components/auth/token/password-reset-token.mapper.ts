import { ResetRequestRecord, ResetTokenPersist } from "./password-reset-token.types";

export function mapPersistRecordToDomain(rawToken: ResetTokenPersist): ResetRequestRecord {
  return {
    userId: rawToken.userId.toString(),
    validatorHash: rawToken.validatorHash,
  };
}
