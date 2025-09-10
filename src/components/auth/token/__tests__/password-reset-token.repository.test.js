const mongoose = require("mongoose");
const resetTokenRepo = require("../password-reset-token.repository.mongo.js");
const resetTokenModel = require("../password-reset-token.model.js");

describe("password-reset-token repository: token create", () => {
  let selector = "a".repeat(32);
  let validatorHash = "bcrypt-hash-placeholder";
  let userId = new mongoose.Types.ObjectId();
  let expiresAt = new Date(Date.now() + 60_000);
  it("saves the token correctly", async () => {
    const saved = await resetTokenRepo.create({
      selector,
      validatorHash,
      userId,
      expiresAt,
    });

    expect(saved).toBeTruthy();
    expect(saved.selector).toBe(selector);
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(saved.usedAt).toBeNull();
    expect(saved.validatorHash).toBe(validatorHash);

    // there should be only one document in DB
    const count = await resetTokenModel.countDocuments({});
    expect(count).toBe(1);
  });

  it("expired token not active", async () => {
    expiresAt = new Date(Date.now() - 1);
    await resetTokenRepo.create({
      selector,
      validatorHash,
      userId,
      expiresAt,
    });

    const foundToken = await resetTokenRepo.findActiveBySelector(selector);
    expect(foundToken).toBeNull();
  });
});

describe("password-reset-token repository methods for existing token", () => {
  let selector;
  beforeEach(async () => {
    selector = "a".repeat(32);
    const validatorHash = "bcrypt-hash-placeholder";
    const userId = new mongoose.Types.ObjectId();
    const expiresAt = new Date(Date.now() + 60_000);

    await resetTokenRepo.create({
      selector,
      validatorHash,
      userId,
      expiresAt,
    });
  });

  it("find and return active token", async () => {
    const foundToken = await resetTokenRepo.findActiveBySelector(selector);

    expect(foundToken).toEqual(
      expect.objectContaining({
        _id: expect.anything(),
        userId: expect.anything(),
        validatorHash: expect.any(String),
      }),
    );
    expect(mongoose.isValidObjectId(foundToken.userId)).toBe(true);
    expect(mongoose.isValidObjectId(foundToken._id)).toBe(true);
    expect(Object.keys(foundToken).sort()).toEqual(
      ["_id", "userId", "validatorHash"].sort(),
    );
  });

  it("consumeBySelector method change usedAt field to Date.now", async () => {
    const methodResponse = await resetTokenRepo.consumeBySelector(selector);
    expect(methodResponse).toBe(true);
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
});
