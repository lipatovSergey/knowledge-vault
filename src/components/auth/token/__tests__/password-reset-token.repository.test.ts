import mongoose from "mongoose";
import resetTokenRepo from "../password-reset-token.repository.mongo";
import { ResetTokenModel } from "../password-reset-token.model";
import type { MongoId, PasswordResetSelector } from "../../../../types/primitives";
import type { CreateTokenInput } from "../password-reset-token.types";

describe("password-reset-token repository", () => {
  let createTokenInput: CreateTokenInput;
  let selector: PasswordResetSelector;
  let userId: MongoId;
  beforeEach(async () => {
    selector = "a".repeat(22);
    let validatorHash = "bcrypt-hash-placeholder";
    userId = new mongoose.Types.ObjectId().toString();
    let expiresAt = new Date(Date.now() + 60_000);
    createTokenInput = {
      selector,
      validatorHash,
      userId,
      expiresAt,
    };
  });

  describe("token create", () => {
    it("saves the token correctly", async () => {
      await resetTokenRepo.create(createTokenInput);

      // there should be only one document in DB
      const count = await ResetTokenModel.countDocuments({});
      expect(count).toBe(1);
    });

    it("expired token not active", async () => {
      createTokenInput.expiresAt = new Date(Date.now() - 1);
      await resetTokenRepo.create(createTokenInput);

      const foundToken = await resetTokenRepo.findActiveBySelector(selector);
      expect(foundToken).toBeNull();
    });
  });

  describe("methods for existing token", () => {
    beforeEach(async () => {
      await resetTokenRepo.create(createTokenInput);
    });
    it("find and return active token", async () => {
      const foundToken = await resetTokenRepo.findActiveBySelector(selector);

      expect(foundToken).not.toBeNull();
      expect(foundToken).toEqual(
        expect.objectContaining({
          userId: expect.anything(),
          validatorHash: expect.any(String),
        }),
      );
      expect(mongoose.isValidObjectId(foundToken!.userId)).toBe(true);
      expect(Object.keys(foundToken!).sort()).toEqual(["userId", "validatorHash"].sort());
    });

    it("consumeBySelector method sets the usedAt field", async () => {
      const methodResponse = await resetTokenRepo.consumeBySelector(selector);
      expect(methodResponse).toBe(true);

      // Directly check the database state to confirm the side-effect
      const tokenInDb = await ResetTokenModel.findOne({ selector }).lean();
      expect(tokenInDb).not.toBeNull();
      expect(tokenInDb!.usedAt).toBeInstanceOf(Date);
    });

    it("repeatable consumeBySelector is impossible", async () => {
      const first = await resetTokenRepo.consumeBySelector(selector);
      expect(first).toBe(true);
      const second = await resetTokenRepo.consumeBySelector(selector);
      expect(second).toBe(false);
      // no active token with this selector
      const after = await resetTokenRepo.findActiveBySelector(selector);
      expect(after).toBeNull();
    });

    it("method removeAllForUser deletes all user's tokens, active and nonactive", async () => {
      // add one more active token for user
      const createSecondTokenInput = {
        ...createTokenInput,
        selector: "b".repeat(22),
        validatorHash: "newValidatorHash",
      };
      await resetTokenRepo.create(createSecondTokenInput);

      // made first token nonactive
      await resetTokenRepo.consumeBySelector(selector);

      const deleted = await resetTokenRepo.removeAllForUser(userId);
      expect(deleted).toBe(2);

      const left = await ResetTokenModel.countDocuments({ userId });
      expect(left).toBe(0);
    });
  });
});
