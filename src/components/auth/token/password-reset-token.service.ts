import { BadRequestError } from "../../../errors/errors.class";
import type { MongoId } from "../../../types/mongo";
import type { ResetTokenRepositoryType } from "./password-reset-token.repository.mongo";
import type * as bcryptType from "bcrypt";
import type { RandomUtilType } from "../../../utils/random.util";

function createResetTokenService({
  resetTokenRepo,
  bcrypt,
  random,
  ttlMs,
}: {
  resetTokenRepo: ResetTokenRepositoryType;
  bcrypt: typeof bcryptType;
  random: RandomUtilType;
  ttlMs: number;
}) {
  return {
    async createTokenForUser(userId: MongoId): Promise<string> {
      const selector = (await random(16)).toString("base64url");
      const validator = (await random(32)).toString("base64url");
      const saltRounds = 10;
      const validatorHash = await bcrypt.hash(validator, saltRounds);
      await resetTokenRepo.create({
        selector,
        validatorHash,
        userId: userId,
        expiresAt: new Date(Date.now() + ttlMs),
      });
      return `${selector}.${validator}`;
    },

    async verifyAndConsume(tokenPair: string): Promise<MongoId> {
      if (!tokenPair || typeof tokenPair !== "string") {
        throw new BadRequestError("Invalid or expired token");
      }
      const [selector, validator] = tokenPair.split(".", 2);
      if (!selector || !validator) {
        throw new BadRequestError("Invalid or expired token");
      }

      const foundToken = await resetTokenRepo.findActiveBySelector(selector);

      // If no token is found, we compare against a dummy hash to ensure the response time is consistent.
      // The cost of a single bcrypt.hash call is negligible in this context.
      const hashToCompare = foundToken
        ? foundToken.validatorHash
        : await bcrypt.hash("dummy", 10);

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
