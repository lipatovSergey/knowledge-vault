import type * as bcryptType from "bcrypt";
import { BCRYPT_SALT_ROUNDS } from "../../../config/env";
import { BadRequestError } from "../../../errors/errors.class";
import type {
  MongoId,
  PasswordResetSelector,
  PasswordResetTokenDomain,
  PasswordResetValidator,
} from "../../../types/primitives";
import type { RandomUtilType } from "../../../utils/random.util";
import { mapDomainTokenToContract } from "../auth.mapper";
import type { ResetTokenRepositoryType } from "./password-reset-token.repository.mongo";

const DUMMY_HASH = "$2b$10$CwTycUXWue0The9StjUM0uJ8c3PHfXcOnItY.r9QB9sSBxWMXyEVO";
export type BcryptAdapter = Pick<typeof bcryptType, "hash" | "compare">;

function createResetTokenService({
  resetTokenRepo,
  bcrypt,
  random,
  ttlMs,
}: {
  resetTokenRepo: ResetTokenRepositoryType;
  bcrypt: BcryptAdapter;
  random: RandomUtilType;
  ttlMs: number;
}) {
  return {
    async createTokenForUser(userId: MongoId): Promise<string> {
      const selector: PasswordResetSelector = (await random(16)).toString("base64url");
      const validator: PasswordResetValidator = (await random(32)).toString("base64url");
      const validatorHash = await bcrypt.hash(validator, BCRYPT_SALT_ROUNDS);
      await resetTokenRepo.create({
        selector,
        validatorHash,
        userId: userId,
        expiresAt: new Date(Date.now() + ttlMs),
      });
      const tokenString = mapDomainTokenToContract({ selector, validator });
      return tokenString;
    },

    async verifyAndConsume(token: PasswordResetTokenDomain): Promise<MongoId> {
      const { selector, validator } = token;
      const foundToken = await resetTokenRepo.findActiveBySelector(selector);

      // If no token is found, we compare against a dummy hash to ensure the response time is consistent.
      // The cost of a single bcrypt.hash call is negligible in this context.
      const hashToCompare = foundToken ? foundToken.validatorHash : DUMMY_HASH;
      const isValid = await bcrypt.compare(validator, hashToCompare);

      // Now we can safely check both conditions without leaking timing information.
      if (!foundToken || !isValid) {
        throw new BadRequestError("Invalid or expired token");
      }

      await resetTokenRepo.consumeBySelector(selector);
      return foundToken.userId.toString();
    },

    async removeAllTokensForUser(userId: MongoId) {
      if (!userId) {
        throw new BadRequestError("User ID must be provided");
      }
      return resetTokenRepo.removeAllForUser(userId);
    },
  };
}

export default createResetTokenService;
