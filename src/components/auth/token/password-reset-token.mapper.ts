import { ResetTokenDomain, ResetTokenPersist } from "./password-reset-token.types";

export function mapPersistTokentoDomain(rawToken: ResetTokenPersist): ResetTokenDomain {
  return {
    userId: rawToken.userId.toString(),
    validatorHash: rawToken.validatorHash,
  };
}
