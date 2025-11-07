import mongoose from "mongoose";
import resetTokenRepo from "../../src/components/auth/token/password-reset-token.repository.mongo";
import type { CreateTokenData } from "../../src/components/auth/token/password-reset-token.repository.mongo";

export async function createExpiredResetToken({
  userId = new mongoose.Types.ObjectId().toString(),
  selector = "expired-selector",
  validatorHash = "expired-validator-hash",
}: Partial<Omit<CreateTokenData, "expiresAt">>): Promise<void> {
  await resetTokenRepo.create({
    selector,
    validatorHash,
    userId,
    expiresAt: new Date(Date.now() - 1000),
  });
}
